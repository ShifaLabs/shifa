import { NextRequest } from "next/server";
import {
  ApiResponse,
  compose,
  withErrorHandling,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import {
  doctorProfilePatchSchema,
  mapZodErrors,
} from "@/modules/doctor/profile/services/doctor.validation";
import {
  getDoctorProfile,
  updateDoctorProfile,
} from "@/modules/doctor/profile/services/doctor.profile.service";

async function handleGetProfile(_req: NextRequest, session: any) {
  const profile = await getDoctorProfile(session?.user || {});
  return ApiResponse.success(profile);
}

async function handleUpdateProfile(req: NextRequest, session: any) {
  const rawBody = await req.text();

  if (!rawBody.trim()) {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "body",
        message: "Request body is required",
      },
    ]);
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "body",
        message: "Invalid JSON body",
      },
    ]);
  }

  const parsed = doctorProfilePatchSchema.safeParse(body);

  if (!parsed.success) {
    return ApiResponse.validationError(
      "Validation failed",
      mapZodErrors(parsed.error),
    );
  }

  const profile = await updateDoctorProfile(session?.user || {}, parsed.data);

  return ApiResponse.success(profile, "Doctor profile updated successfully");
}

export const GET = compose(
  withErrorHandling,
  withRole("doctor"),
)(handleGetProfile);

export const PATCH = compose(
  withErrorHandling,
  withRole("doctor"),
)(handleUpdateProfile);
