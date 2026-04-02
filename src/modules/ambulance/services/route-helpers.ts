import { authOptions } from "@/infrastructure/auth/auth.config";
import { initializeIndexes } from "@/infrastructure/db/dbIndexes";
import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

export async function requireSession(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: ApiResponse.unauthorized("Authentication required") };
  }

  if (allowedRoles?.length && !allowedRoles.includes(session.user.role)) {
    return { error: ApiResponse.forbidden("Access forbidden"), session: null };
  }

  await initializeIndexes();

  return { session };
}

function isGeoIndexError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("unable to find index for $geoNear query") ||
    message.includes(
      "Required index creation failed for ambulanceAvailability.currentLocation",
    )
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return ApiResponse.validationError(
      "Validation failed",
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  if (isGeoIndexError(error)) {
    console.error("[ambulance.route] Geo index bootstrap failed:", error);
    return ApiResponse.error(
      "Ambulance search is temporarily unavailable while location data is being prepared. Please try again in a moment.",
      503,
    );
  }

  const message =
    error instanceof Error ? error.message : "Internal server error";
  const status =
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
      ? Number((error as { status?: number }).status)
      : 500;

  return ApiResponse.error(message, status);
}
