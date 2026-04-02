"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2, User } from "lucide-react";
import { toast, Toaster } from "sonner";

import { imageUpload } from "@/infrastructure/lib/legacy/imageUpload";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

const profileFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(80, "Full name must be at most 80 characters")
    .refine(
      (value) => !value || value.length >= 2,
      "Full name must be at least 2 characters",
    ),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\+?[0-9()\-\s]{7,20}$/.test(value),
      "Invalid phone number",
    ),
  gender: z.enum(["male", "female", "other", ""]),
  age: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "string") return Number(value);
    return value;
  }, z.number("Age must be a valid number").int("Age must be a whole number").min(1, "Age must be at least 1").max(120, "Age must be at most 120").optional()),
  street: z.string().trim().max(120, "Street is too long"),
  city: z.string().trim().max(80, "City is too long"),
  country: z.string().trim().max(80, "Country is too long"),
  zipCode: z.string().trim().max(20, "Zip code is too long"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ProfileApiData = {
  fullName: string | null;
  email: string;
  phone: string | null;
  gender: "male" | "female" | "other" | null;
  age: number | null;
  address?: {
    street?: string | null;
    city?: string | null;
    country?: string | null;
    zipCode?: string | null;
  } | null;
  profileImage: string | null;
  profileCompleted: boolean;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  validationErrors?: Array<{ field?: string; message?: string }>;
};

async function parseApiEnvelope<T>(
  response: Response,
): Promise<ApiEnvelope<T> | null> {
  const raw = await response.text();

  if (!raw || !raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

function buildHttpErrorMessage(baseMessage: string, response: Response) {
  const status = response.status ? `HTTP ${response.status}` : "request failed";
  const contentType =
    response.headers.get("content-type") || "unknown-content-type";
  return `${baseMessage} (${status}, ${contentType})`;
}

function getSessionFallbackProfile(sessionUser: any): ProfileApiData {
  return {
    fullName: sessionUser?.name ?? null,
    email: sessionUser?.email ?? "",
    phone: null,
    gender: null,
    age: null,
    address: {
      street: null,
      city: null,
      country: null,
      zipCode: null,
    },
    profileImage: sessionUser?.image ?? null,
    profileCompleted: false,
  };
}

const COMPLETION_FIELDS = [
  { key: "fullName", label: "Full Name" },
  { key: "phone", label: "Phone" },
  { key: "gender", label: "Gender" },
  { key: "age", label: "Age" },
  { key: "street", label: "Street" },
  { key: "city", label: "City" },
] as const;

const API_TO_FORM_FIELD_MAP: Record<string, keyof ProfileFormValues> = {
  fullName: "fullName",
  phone: "phone",
  gender: "gender",
  age: "age",
  "address.street": "street",
  "address.city": "city",
  "address.country": "country",
  "address.zipCode": "zipCode",
};

function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function mapApiProfileToForm(profile: ProfileApiData): ProfileFormValues {
  return {
    fullName: profile.fullName ?? "",
    phone: profile.phone ?? "",
    gender: profile.gender ?? "",
    age: profile.age ?? undefined,
    street: profile.address?.street ?? "",
    city: profile.address?.city ?? "",
    country: profile.address?.country ?? "",
    zipCode: profile.address?.zipCode ?? "",
  };
}

function mapApiProfileToPayload(
  values: ProfileFormValues,
  imageUrl: string | null,
) {
  return {
    fullName: values.fullName.trim(),
    phone: toNullableString(values.phone),
    gender: values.gender || null,
    age: values.age ?? null,
    profileImage: imageUrl,
    address: {
      street: toNullableString(values.street),
      city: toNullableString(values.city),
      country: toNullableString(values.country),
      zipCode: toNullableString(values.zipCode),
    },
  };
}

function buildPartialProfilePatchPayload(
  values: ProfileFormValues,
  dirtyFields: Partial<Record<keyof ProfileFormValues, boolean>>,
  imageUrl: string | null,
  imageChanged: boolean,
) {
  const payload: Record<string, unknown> = {};

  if (dirtyFields.fullName) {
    payload.fullName = toNullableString(values.fullName);
  }

  if (dirtyFields.phone) {
    payload.phone = toNullableString(values.phone);
  }

  if (dirtyFields.gender) {
    payload.gender = values.gender || null;
  }

  if (dirtyFields.age) {
    payload.age = values.age ?? null;
  }

  const addressPatch: Record<string, unknown> = {};

  if (dirtyFields.street) {
    addressPatch.street = toNullableString(values.street);
  }

  if (dirtyFields.city) {
    addressPatch.city = toNullableString(values.city);
  }

  if (dirtyFields.country) {
    addressPatch.country = toNullableString(values.country);
  }

  if (dirtyFields.zipCode) {
    addressPatch.zipCode = toNullableString(values.zipCode);
  }

  if (Object.keys(addressPatch).length > 0) {
    payload.address = addressPatch;
  }

  if (imageChanged) {
    payload.profileImage = imageUrl ?? null;
  }

  return payload;
}

export default function PatientMyProfilePage() {
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      gender: "",
      age: undefined,
      street: "",
      city: "",
      country: "",
      zipCode: "",
    },
  });

  const completionValues = useWatch({
    control: form.control,
    name: ["fullName", "phone", "gender", "age", "street", "city"],
  });

  const completionState = useMemo(() => {
    const [fullName, phone, gender, age, street, city] = completionValues;

    const checks = {
      fullName: Boolean(String(fullName ?? "").trim()),
      phone: Boolean(String(phone ?? "").trim()),
      gender: Boolean(String(gender ?? "").trim()),
      age: typeof age === "number" && Number.isFinite(age),
      street: Boolean(String(street ?? "").trim()),
      city: Boolean(String(city ?? "").trim()),
    };

    const completedCount = COMPLETION_FIELDS.filter(
      (item) => checks[item.key],
    ).length;
    const percentage = Math.round(
      (completedCount / COMPLETION_FIELDS.length) * 100,
    );
    const missing = COMPLETION_FIELDS.filter((item) => !checks[item.key]).map(
      (item) => item.label,
    );

    return {
      completedCount,
      percentage,
      missing,
    };
  }, [completionValues]);

  const canSubmit =
    (form.formState.isDirty || Boolean(selectedImageFile)) &&
    form.formState.isValid &&
    !form.formState.isSubmitting &&
    !isUploadingImage;

  const applyProfileToUi = useCallback(
    (profile: ProfileApiData) => {
      form.reset(mapApiProfileToForm(profile));
      setEmail(profile.email ?? "");
      setPreviewUrl(profile.profileImage ?? null);
      setProfileCompleted(Boolean(profile.profileCompleted));
    },
    [form],
  );

  const syncSessionProfile = useCallback(
    async (profile: ProfileApiData) => {
      if (!update) return;

      try {
        await update({
          name: profile.fullName ?? session?.user?.name ?? "",
          image: profile.profileImage ?? null,
          profileCompleted: profile.profileCompleted,
        });
      } catch {
        // Session refresh failure should not block successful profile save.
      }
    },
    [update, session?.user?.name],
  );

  const fetchLatestProfile = useCallback(async () => {
    const response = await fetch("/api/users/profile", {
      method: "GET",
      cache: "no-store",
    });

    const result = await parseApiEnvelope<ProfileApiData>(response);

    if (!response.ok || !result?.success || !result.data) {
      throw new Error(
        buildHttpErrorMessage("Failed to refresh profile", response),
      );
    }

    return result.data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        setIsFetchingProfile(true);

        const profile = await fetchLatestProfile();

        if (!isMounted) return;

        applyProfileToUi(profile);
      } catch (error: any) {
        if (isMounted) {
          const fallbackProfile = getSessionFallbackProfile(session?.user);
          form.reset(mapApiProfileToForm(fallbackProfile));
          setEmail(fallbackProfile.email);
          setPreviewUrl(fallbackProfile.profileImage ?? null);
          setProfileCompleted(false);
          toast.error(error?.message || "Could not load profile");
        }
      } finally {
        if (isMounted) {
          setIsFetchingProfile(false);
        }
      }
    }

    if (status === "authenticated") {
      fetchProfile();
    } else if (status !== "loading") {
      setIsFetchingProfile(false);
    }

    return () => {
      isMounted = false;
    };
  }, [applyProfileToUi, fetchLatestProfile, form, status, session?.user]);

  useEffect(() => {
    const shouldWarn = form.formState.isDirty || Boolean(selectedImageFile);

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarn) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [form.formState.isDirty, selectedImageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }

    setSelectedImageFile(file);
    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      form.clearErrors();
      let uploadedImageUrl = previewUrl ?? null;

      if (selectedImageFile) {
        setIsUploadingImage(true);
        uploadedImageUrl = await imageUpload(selectedImageFile);
      }

      const dirtyFields = form.formState.dirtyFields as Partial<
        Record<keyof ProfileFormValues, boolean>
      >;

      const payload = buildPartialProfilePatchPayload(
        values,
        dirtyFields,
        uploadedImageUrl,
        Boolean(selectedImageFile),
      );

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await parseApiEnvelope<ProfileApiData>(response);

      if (!result) {
        if (response.ok) {
          // Some deployments return 200/204 without JSON body; re-fetch to keep UX smooth.
          const refreshedProfile = await fetchLatestProfile();
          applyProfileToUi(refreshedProfile);
          await syncSessionProfile(refreshedProfile);
          setLastSavedAt(new Date());
          setSelectedImageFile(null);
          toast.success("Profile updated successfully");
          return;
        }

        throw new Error(
          buildHttpErrorMessage("Failed to update profile", response),
        );
      }

      if (!response.ok || !result?.success) {
        if (Array.isArray(result.validationErrors)) {
          result.validationErrors.forEach(
            (item: { field?: string; message?: string }) => {
              const mappedField = item.field
                ? API_TO_FORM_FIELD_MAP[item.field]
                : undefined;

              if (mappedField && item.message) {
                form.setError(mappedField, {
                  type: "server",
                  message: item.message,
                });
              }
            },
          );

          throw new Error("Please fix the highlighted fields");
        }

        throw new Error(result?.error || "Failed to update profile");
      }

      if (!result.data) {
        throw new Error("Updated profile data not returned by server");
      }

      const updatedProfile = result.data;
      applyProfileToUi(updatedProfile);
      await syncSessionProfile(updatedProfile);
      setLastSavedAt(new Date());
      setSelectedImageFile(null);

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(
        error?.message || "Something went wrong while saving profile",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (status === "loading" || isFetchingProfile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session?.user?.role !== "patient") {
    return (
      <Card className="max-w-3xl mx-auto border-red-100">
        <CardHeader>
          <CardTitle className="text-red-600">Access denied</CardTitle>
          <CardDescription>
            This page is only available for patient accounts.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <Toaster richColors position="top-right" />

      <Card className="border-slate-200 shadow-sm p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            My Profile
          </CardTitle>
          <CardDescription>
            Keep your profile details up to date for faster appointments and
            onboarding.
          </CardDescription>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Profile completion
              </span>
              <span className="text-slate-600">
                {completionState.completedCount}/{COMPLETION_FIELDS.length}{" "}
                fields ({completionState.percentage}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${completionState.percentage}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`rounded-full px-2.5 py-1 font-semibold ${
                  profileCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {profileCompleted ? "Profile completed" : "Profile incomplete"}
              </span>
              {lastSavedAt && (
                <span className="text-slate-500">
                  Last saved at{" "}
                  {lastSavedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {!lastSavedAt && !form.formState.isDirty && (
                <span className="text-slate-500">No unsaved changes</span>
              )}
            </div>
            {completionState.missing.length > 0 && (
              <p className="text-xs text-slate-500">
                Missing: {completionState.missing.join(", ")}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <section className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  Profile Image
                </h2>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border border-slate-200">
                    <AvatarImage
                      src={previewUrl ?? ""}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <p className="text-xs text-slate-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  Personal Information
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input value={email} disabled readOnly />
                    </FormControl>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+8801XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          value={field.value || "not_set"}
                          onValueChange={(value) => {
                            field.onChange(value === "not_set" ? "" : value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={120}
                            placeholder="Enter your age"
                            value={field.value ?? ""}
                            onChange={(event) =>
                              field.onChange(event.target.value)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  Address
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="House, road, area" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zip Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Zip code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="min-w-40"
                >
                  {(form.formState.isSubmitting || isUploadingImage) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {form.formState.isSubmitting || isUploadingImage
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
