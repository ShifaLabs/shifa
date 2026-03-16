import { NextRequest } from "next/server";
import { ApiResponse, compose, withErrorHandling, withRole } from "@/lib/api";
import {
  mapZodErrors,
  patientProfilePatchSchema,
} from "@/modules/users/user.validation";
import {
  getPatientProfile,
  updatePatientProfile,
} from "@/modules/users/user.service";

async function handleGetProfile(req: NextRequest, session: any) {
  const userId = session?.user?.id;

  if (!userId) {
    return ApiResponse.unauthorized("Missing authenticated user id");
  }

  const profile = await getPatientProfile(userId);
  return ApiResponse.success(profile);
}

async function handleUpdateProfile(req: NextRequest, session: any) {
  const userId = session?.user?.id;

  if (!userId) {
    return ApiResponse.unauthorized("Missing authenticated user id");
  }

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

  const parsed = patientProfilePatchSchema.safeParse(body);

  if (!parsed.success) {
    return ApiResponse.validationError(
      "Validation failed",
      mapZodErrors(parsed.error),
    );
  }

  const profile = await updatePatientProfile(userId, parsed.data);

  return ApiResponse.success(profile, "Profile updated successfully");
}

export const GET = compose(
  withErrorHandling,
  withRole("patient"),
)(handleGetProfile);

export const PATCH = compose(
  withErrorHandling,
  withRole("patient"),
)(handleUpdateProfile);
