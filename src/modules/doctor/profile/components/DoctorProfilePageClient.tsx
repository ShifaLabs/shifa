"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { imageUpload } from "@/infrastructure/lib/legacy/imageUpload";

import {
  fetchDoctorProfileApi,
  updateDoctorProfileApi,
} from "../services/doctor-profile.client";
import {
  DoctorProfileApiData,
  DoctorProfileFormValues,
} from "../types/doctor-profile.types";
import {
  getSessionFallbackProfile,
  mapApiToForm,
  mapFormToPatchPayload,
} from "../utils/doctor-profile.mappers";
import { doctorProfileFormSchema } from "../utils/doctor-profile.schema";
import DoctorProfileForms from "./DoctorProfileForms";
import DoctorProfileHeaderCard from "./DoctorProfileHeaderCard";

export default function DoctorProfilePageClient() {
  const { data: session, status, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileMeta, setProfileMeta] = useState<DoctorProfileApiData | null>(
    null,
  );

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phone: "",
      gender: "",
      age: undefined,
      specialization: "",
      consultationFee: undefined,
      experienceYears: undefined,
      street: "",
      city: "",
      country: "",
      zipCode: "",
    },
  });

  const watched = useWatch({
    control: form.control,
    name: [
      "fullName",
      "phone",
      "gender",
      "age",
      "specialization",
      "consultationFee",
      "street",
      "city",
    ],
  });

  const completionPercentage = useMemo(() => {
    const filled = watched.filter((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "number") return Number.isFinite(value);
      return String(value).trim().length > 0;
    }).length;

    return Math.round((filled / watched.length) * 100);
  }, [watched]);

  const applyProfileToUi = useCallback(
    (profile: DoctorProfileApiData) => {
      setProfileMeta(profile);
      setProfileImageUrl(profile.profileImage ?? null);
      form.reset(mapApiToForm(profile), {
        keepDirty: false,
        keepErrors: false,
        keepTouched: false,
        keepIsSubmitted: false,
      });
    },
    [form],
  );

  const fetchProfile = useCallback(async () => {
    if (!session?.user) return;

    setIsFetchingProfile(true);

    try {
      const profile = await fetchDoctorProfileApi();
      applyProfileToUi(profile);
    } catch (error: any) {
      const fallback = getSessionFallbackProfile(session.user);
      applyProfileToUi(fallback);
      toast.error(error?.message || "Profile load failed, using fallback data");
    } finally {
      setIsFetchingProfile(false);
    }
  }, [applyProfileToUi, session?.user]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }

    if (status === "unauthenticated") {
      setIsFetchingProfile(false);
    }
  }, [fetchProfile, status]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function onSelectProfileImage(file: File | null) {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be 5MB or less");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    setSelectedImageFile(file);
  }

  async function onSubmit(values: DoctorProfileFormValues) {
    try {
      let uploadedImageUrl = profileImageUrl;

      if (selectedImageFile) {
        setIsUploadingImage(true);
        uploadedImageUrl = await imageUpload(selectedImageFile);
      }

      const payload = mapFormToPatchPayload(values, uploadedImageUrl ?? null);
      const updatedProfile = await updateDoctorProfileApi(payload);

      applyProfileToUi(updatedProfile);
      setSelectedImageFile(null);

      await update({
        name: updatedProfile.fullName || session?.user?.name || "",
        image: updatedProfile.profileImage || session?.user?.image || null,
      });

      toast.success("Doctor profile updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Profile update failed");
    } finally {
      setIsUploadingImage(false);
    }
  }

  const isBusy =
    form.formState.isSubmitting || isUploadingImage || isFetchingProfile;

  const displayImage =
    previewUrl || profileImageUrl || session?.user?.image || "";

  if (status === "loading" || isFetchingProfile) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <>
      <Toaster richColors position="top-right" />

      <div className="space-y-6">
        <DoctorProfileHeaderCard
          profileMeta={profileMeta}
          displayImage={displayImage}
          completionPercentage={completionPercentage}
          isBusy={isBusy}
          onSelectImageClick={() => fileInputRef.current?.click()}
        />

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(event) =>
            onSelectProfileImage(event.target.files?.[0] || null)
          }
        />

        <DoctorProfileForms
          form={form}
          isBusy={isBusy}
          profileMeta={profileMeta}
          onSubmit={onSubmit}
        />
      </div>
    </>
  );
}
