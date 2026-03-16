import { z } from "zod";

const GENDER_VALUES = ["male", "female", "other"] as const;
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,20}$/;

function sanitizeString(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function nullableSanitizedString(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined) return undefined;
      const normalized = sanitizeString(value);
      return normalized.length ? normalized : null;
    })
    .refine(
      (value) => value === undefined || value === null || value.length <= max,
      `Must be at most ${max} characters`,
    );
}

const ageFieldSchema = z
  .preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }

      if (typeof value === "string") {
        return Number(value);
      }

      return value;
    },
    z
      .number()
      .int()
      .min(1, "Age must be at least 1")
      .max(120, "Age must be at most 120"),
  )
  .optional();

const phoneFieldSchema = nullableSanitizedString(20).refine(
  (value) => value === undefined || value === null || PHONE_REGEX.test(value),
  "Invalid phone number format",
);

const genderFieldSchema = z
  .union([z.enum(GENDER_VALUES), z.null(), z.undefined()])
  .optional();

const addressPatchSchema = z
  .object({
    street: nullableSanitizedString(120).optional(),
    city: nullableSanitizedString(80).optional(),
    country: nullableSanitizedString(80).optional(),
    zipCode: nullableSanitizedString(20).optional(),
  })
  .strict()
  .optional();

export const patientProfilePatchSchema = z
  .object({
    fullName: nullableSanitizedString(80).optional(),
    phone: phoneFieldSchema.optional(),
    gender: genderFieldSchema,
    age: ageFieldSchema,
    profileImage: nullableSanitizedString(500)
      .refine((value) => {
        if (value === undefined || value === null) return true;
        return /^https?:\/\//i.test(value);
      }, "Profile image must be a valid URL")
      .optional(),
    address: addressPatchSchema,
  })
  .strict();

export type PatientProfilePatchInput = z.infer<
  typeof patientProfilePatchSchema
>;

export type PatientProfileResponse = {
  fullName: string | null;
  email: string;
  phone: string | null;
  gender: "male" | "female" | "other" | null;
  age: number | null;
  address: {
    street: string | null;
    city: string | null;
    country: string | null;
    zipCode: string | null;
  };
  profileImage: string | null;
  profileCompleted: boolean;
};

export function mapZodErrors(error: z.ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
