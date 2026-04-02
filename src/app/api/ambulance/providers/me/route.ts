import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import {
  getMyAmbulanceProviderProfile,
  updateMyAmbulanceProviderProfile,
} from "@/modules/ambulance/services/provider.service";
import {
  handleRouteError,
  requireSession,
} from "@/modules/ambulance/services/route-helpers";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";

export async function GET() {
  try {
    const auth = await requireSession(["ambulance_provider", "patient"]);
    if (auth.error) return auth.error;

    const data = await getMyAmbulanceProviderProfile(auth.session!.user.id);
    return ApiResponse.success(serializeAmbulanceDoc(data));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireSession(["ambulance_provider", "patient"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const data = await updateMyAmbulanceProviderProfile(
      auth.session!.user.id,
      body,
    );
    return ApiResponse.success(
      serializeAmbulanceDoc(data),
      "Ambulance provider profile updated",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
