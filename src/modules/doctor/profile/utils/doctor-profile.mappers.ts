import {
  DoctorProfileApiData,
  DoctorProfileFormValues,
} from "../types/doctor-profile.types";

export function toNullableString(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export function getSessionFallbackProfile(
  sessionUser: any,
): DoctorProfileApiData {
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
    specialization: null,
    licenseNumber: null,
    experienceYears: null,
    consultationFee: null,
    isVerified: false,
    status: "pending",
    approvalStatus: "pending",
    updatedAt: null,
  };
}

export function mapApiToForm(
  profile: DoctorProfileApiData,
): DoctorProfileFormValues {
  return {
    fullName: profile.fullName ?? "",
    phone: profile.phone ?? "",
    gender: profile.gender ?? "",
    age: profile.age ?? undefined,
    specialization: profile.specialization ?? "",
    consultationFee: profile.consultationFee ?? undefined,
    experienceYears: profile.experienceYears ?? undefined,
    street: profile.address?.street ?? "",
    city: profile.address?.city ?? "",
    country: profile.address?.country ?? "",
    zipCode: profile.address?.zipCode ?? "",
  };
}

export function mapFormToPatchPayload(
  values: DoctorProfileFormValues,
  imageUrl: string | null,
) {
  return {
    fullName: toNullableString(values.fullName || ""),
    phone: toNullableString(values.phone),
    gender: values.gender || null,
    age: values.age ?? null,
    specialization: toNullableString(values.specialization),
    consultationFee: values.consultationFee ?? null,
    experienceYears: values.experienceYears ?? null,
    profileImage: imageUrl,
    address: {
      street: toNullableString(values.street),
      city: toNullableString(values.city),
      country: toNullableString(values.country),
      zipCode: toNullableString(values.zipCode),
    },
  };
}

export function formatDateTime(value: string | null) {
  if (!value) return "Not yet saved";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
}
