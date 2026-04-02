export type DoctorProfileFormValues = {
  fullName?: string;
  phone: string;
  gender: "male" | "female" | "other" | "";
  age?: number;
  specialization: string;
  consultationFee?: number;
  experienceYears?: number;
  street: string;
  city: string;
  country: string;
  zipCode: string;
};

export type DoctorProfileApiData = {
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
  specialization: string | null;
  licenseNumber: string | null;
  experienceYears: number | null;
  consultationFee: number | null;
  isVerified: boolean;
  status: string;
  approvalStatus: string;
  updatedAt: string | null;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  validationErrors?: Array<{ field?: string; message?: string }>;
};
