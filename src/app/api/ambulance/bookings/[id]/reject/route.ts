import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { rejectAmbulanceBooking } from "@/modules/ambulance/services/booking.service";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";
import {
  handleRouteError,
  requireSession,
} from "@/modules/ambulance/services/route-helpers";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireSession(["ambulance_provider"]);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const data = await rejectAmbulanceBooking(id, auth.session!.user.id, body);
    return ApiResponse.success(
      serializeAmbulanceDoc(data),
      "Ambulance booking rejected",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
