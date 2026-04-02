import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";
import {
  requireSession,
  handleRouteError,
} from "@/modules/ambulance/services/route-helpers";
import { updateAmbulanceLiveLocation } from "@/modules/ambulance/services/provider.service";

export async function POST(req: Request) {
  try {
    const auth = await requireSession(["ambulance_provider", "patient"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const data = await updateAmbulanceLiveLocation(auth.session!.user.id, body);
    return ApiResponse.success(
      serializeAmbulanceDoc(data),
      "Ambulance location updated",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
