import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { searchNearbyAmbulances } from "@/modules/ambulance/services/search.service";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";
import { handleRouteError } from "@/modules/ambulance/services/route-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await searchNearbyAmbulances({
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
      radius: searchParams.get("radius") || undefined,
      vehicleType: searchParams.get("vehicleType") || undefined,
      limit: searchParams.get("limit") || undefined,
    });
    return ApiResponse.success(serializeAmbulanceDoc(data));
  } catch (error) {
    return handleRouteError(error);
  }
}
