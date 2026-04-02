import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { getAmbulanceBookingById } from "@/modules/ambulance/services/booking.service";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";
import {
  handleRouteError,
  requireSession,
} from "@/modules/ambulance/services/route-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession([
      "patient",
      "ambulance_provider",
      "admin",
    ]);
    if (auth.error) return auth.error;

    const { id } = await params;
    const data = await getAmbulanceBookingById(id);
    return ApiResponse.success(serializeAmbulanceDoc(data));
  } catch (error) {
    return handleRouteError(error);
  }
}
