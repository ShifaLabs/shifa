import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { cancelAmbulanceBooking } from "@/modules/ambulance/services/booking.service";
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
    const auth = await requireSession(["patient", "admin"]);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const data = await cancelAmbulanceBooking(
      id,
      auth.session!.user.id,
      auth.session!.user.role,
      body,
    );
    return ApiResponse.success(
      serializeAmbulanceDoc(data),
      "Ambulance booking cancelled",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
