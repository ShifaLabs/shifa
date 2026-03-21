import { NextRequest } from "next/server";
import { z } from "zod";
import {
  ApiResponse,
  compose,
  withErrorHandling,
  withRateLimit,
} from "@/infrastructure/lib/legacy/api";
import {
  getNearbyHospitals,
  nearbyHospitalsConfig,
} from "@/modules/hospital/service/nearby-hospitals.service";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce
    .number()
    .int()
    .positive()
    .max(nearbyHospitalsConfig.MAX_RADIUS_M)
    .optional(),
});

async function getNearbyHospitalsRoute(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const parsed = querySchema.safeParse({
    lat: searchParams.get("lat"),
    lng: searchParams.get("lng"),
    radius:
      searchParams.get("radius") || nearbyHospitalsConfig.DEFAULT_RADIUS_M,
  });

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return ApiResponse.validationError("Invalid location parameters", errors);
  }

  const result = await getNearbyHospitals(parsed.data);
  return ApiResponse.success(result, "Nearby hospitals fetched successfully");
}

export const GET = compose(
  withErrorHandling,
  withRateLimit(
    Number(process.env.HOSPITALS_RATE_LIMIT_MAX || 30),
    Number(process.env.HOSPITALS_RATE_LIMIT_WINDOW_MS || 60_000),
  ),
)(getNearbyHospitalsRoute);
