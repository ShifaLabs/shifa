import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import {
  createAmbulanceBooking,
  listAmbulanceBookingsForUser,
} from "@/modules/ambulance/services/booking.service";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";
import {
  handleRouteError,
  requireSession,
} from "@/modules/ambulance/services/route-helpers";

export async function GET() {
  try {
    const auth = await requireSession([
      "patient",
      "ambulance_provider",
      "admin",
    ]);
    if (auth.error) return auth.error;

    const data = await listAmbulanceBookingsForUser(
      auth.session!.user.id,
      auth.session!.user.role,
    );
    return ApiResponse.success(serializeAmbulanceDoc(data));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireSession(["patient"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const data = await createAmbulanceBooking(auth.session!.user.id, body);
    return ApiResponse.created(
      serializeAmbulanceDoc(data),
      "Ambulance booking created",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
