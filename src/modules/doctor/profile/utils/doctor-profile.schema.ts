import { z } from "zod";

export const doctorProfileFormSchema = z.object({
  fullName: z.string().trim().max(80).optional(),
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
  }, z.number().int().min(18).max(100).optional()),
  specialization: z.string().trim().max(100),
  consultationFee: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "string") return Number(value);
    return value;
  }, z.number().min(0).max(200000).optional()),
  experienceYears: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    if (typeof value === "string") return Number(value);
    return value;
  }, z.number().int().min(0).max(80).optional()),
  street: z.string().trim().max(120),
  city: z.string().trim().max(80),
  country: z.string().trim().max(80),
  zipCode: z.string().trim().max(20),
});

export type DoctorProfileFormSchemaValues = z.infer<
  typeof doctorProfileFormSchema
>;
