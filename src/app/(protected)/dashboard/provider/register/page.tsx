"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MapPin,
  Truck,
  User,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

const formSchema = z.object({
  displayName: z.string().min(3, "Provider name must be at least 3 characters"),
  organizationType: z.enum(["hospital", "private", "individual"]),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Full address is required"),
  serviceArea: z.string().min(1, "At least one service area required"),
  lat: z.string().min(1, "Latitude required"),
  lng: z.string().min(1, "Longitude required"),
  vehicleNumber: z.string().min(1, "Vehicle number required"),
  vehicleType: z.enum(["basic", "icu"]),
  driverName: z.string().min(3, "Driver name required"),
  driverPhone: z.string().min(10, "Driver phone required"),
  capabilities: z.string().optional(),
  equipment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ExistingProfile = {
  provider?: {
    approvalStatus?: string;
    displayName?: string;
    serviceArea?: string[];
  };
  vehicles?: Array<{
    vehicleNumber?: string;
    vehicleType?: string;
  }>;
};

const defaultValues: FormValues = {
  organizationType: "private",
  vehicleType: "basic",
  lat: "",
  lng: "",
  displayName: "",
  email: "",
  phone: "",
  address: "",
  serviceArea: "",
  vehicleNumber: "",
  driverName: "",
  driverPhone: "",
  capabilities: "",
  equipment: "",
};

function getStatusTone(status?: string) {
  if (status === "approved") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (status === "rejected") return "text-rose-700 bg-rose-50 border-rose-200";
  if (status === "suspended") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-sky-700 bg-sky-50 border-sky-200";
}

export default function ProviderRegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<ExistingProfile | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    async function loadExistingProfile() {
      try {
        const res = await fetch("/api/ambulance/providers/me");
        if (!res.ok) {
          setExistingProfile(null);
          return;
        }

        const json = await res.json();
        setExistingProfile(json.data || null);
      } catch {
        setExistingProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    }

    void loadExistingProfile();
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("lat", String(position.coords.latitude));
        form.setValue("lng", String(position.coords.longitude));
        form.clearErrors(["lat", "lng"]);
        toast.success("Base location captured.");
      },
      () => toast.error("Could not retrieve location."),
    );
  };

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        displayName: values.displayName,
        organizationType: values.organizationType,
        contact: {
          phone: values.phone,
          email: values.email,
          address: values.address,
        },
        serviceArea: values.serviceArea
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        baseLocation: {
          type: "Point",
          coordinates: [Number(values.lng), Number(values.lat)],
        },
        vehicle: {
          vehicleNumber: values.vehicleNumber,
          vehicleType: values.vehicleType,
          capabilities: values.capabilities
            ? values.capabilities
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
          driver: {
            name: values.driverName,
            phone: values.driverPhone,
          },
          equipment: values.equipment
            ? values.equipment
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        },
      };

      const res = await fetch("/api/ambulance/providers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        setServerError(
          responseData.message ||
            responseData.error ||
            "Failed to submit ambulance provider application.",
        );
        return;
      }

      setExistingProfile(responseData.data || null);
      toast.success(
        "Application submitted. Your provider profile will go live after admin approval.",
      );
    } catch (error: any) {
      setServerError(error?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  const approvalStatus = existingProfile?.provider?.approvalStatus;
  const hasExistingApplication = Boolean(existingProfile?.provider);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F6F68]/10 text-[#1F6F68]">
          <Truck size={32} />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900 uppercase">
          Partner with Shifa
        </h1>
        <p className="mx-auto max-w-md text-zinc-500">
          Apply as an ambulance provider. Your application stays under your patient
          account until the admin team approves it for dispatch operations.
        </p>
      </div>

      {loadingProfile ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
          Loading provider application...
        </div>
      ) : null}

      {!loadingProfile && hasExistingApplication ? (
        <Alert className={`mb-6 rounded-2xl border ${getStatusTone(approvalStatus)}`}>
          {approvalStatus === "approved" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            Ambulance provider status: {approvalStatus || "pending"}
          </AlertTitle>
          <AlertDescription>
            {approvalStatus === "approved"
              ? "Your provider profile is approved. Use the ambulance provider dashboard to go online and start dispatch."
              : approvalStatus === "suspended"
                ? "Your provider profile is suspended. Contact an admin before going online again."
                : approvalStatus === "rejected"
                  ? "Your application was rejected. Review the details with an admin before submitting a new one."
                  : "Your application is pending admin approval. You will appear in patient search only after approval and when you go online."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {serverError ? (
            <Alert
              variant="destructive"
              className="rounded-2xl border-2 animate-in fade-in slide-in-from-top-2"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration Failed</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <Card className="overflow-hidden rounded-[2rem] border-zinc-100 shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-2 text-[#1F6F68]">
                <User size={18} />
                <h2 className="font-black uppercase tracking-[0.15em] text-[11px]">
                  Provider Information
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City Life Ambulance"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={hasExistingApplication}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="hospital">Hospital Owned</SelectItem>
                          <SelectItem value="private">Private Fleet</SelectItem>
                          <SelectItem value="individual">Individual Driver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hotline/Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+880 1XXX XXXXXX"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contact@provider.com"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Full Office Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="House, Road, Block, City"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[2rem] border-zinc-100 shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-2 text-[#1F6F68]">
                <MapPin size={18} />
                <h2 className="font-black uppercase tracking-[0.15em] text-[11px]">
                  Location & Dispatch
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="serviceArea"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Service Areas</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dhaka, Gulshan, Banani, Uttara"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormDescription>
                        These areas describe where your fleet can respond quickly.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-end gap-3 md:col-span-2">
                  <FormField
                    control={form.control}
                    name="lat"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="23.8..."
                            {...field}
                            className="h-12 rounded-xl"
                            readOnly
                            disabled={hasExistingApplication}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lng"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="90.3..."
                            {...field}
                            className="h-12 rounded-xl"
                            readOnly
                            disabled={hasExistingApplication}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 gap-2 rounded-xl border-[#1F6F68] px-6 text-[#1F6F68] hover:bg-[#1F6F68]/5"
                    onClick={useCurrentLocation}
                    disabled={hasExistingApplication}
                  >
                    <MapPin size={16} />
                    GPS
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[2rem] border-zinc-100 shadow-sm">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center gap-2 text-primary">
                <Activity size={18} />
                <h2 className="font-black uppercase tracking-[0.15em] text-[11px]">
                  Primary Vehicle Details
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="vehicleNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DHA-METRO-12345"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={hasExistingApplication}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="basic">
                            Basic Life Support (BLS)
                          </SelectItem>
                          <SelectItem value="icu">Advanced ICU Support</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Supported vehicle types in the current dispatch system.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Driver Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Full Name"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driverPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driver Mobile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="017XXXXXXXX"
                          {...field}
                          className="h-12 rounded-xl"
                          disabled={hasExistingApplication}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={submitting || hasExistingApplication}
            className="h-16 w-full rounded-[1.5rem] bg-[#1F6F68] text-lg font-black shadow-xl shadow-[#1F6F68]/20 transition-all hover:bg-[#1F6F68]/90 active:scale-[0.97]"
          >
            {submitting ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                PROCESSING APPLICATION...
              </span>
            ) : hasExistingApplication ? (
              "APPLICATION ALREADY SUBMITTED"
            ) : (
              "REGISTER PROVIDER"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
