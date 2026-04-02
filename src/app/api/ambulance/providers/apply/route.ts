import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { applyAsAmbulanceProvider } from "@/modules/ambulance/services/provider.service";
import {
  handleRouteError,
  requireSession,
} from "@/modules/ambulance/services/route-helpers";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";

export async function POST(req: Request) {
  try {
    const auth = await requireSession(["patient"]);
    if (auth.error) return auth.error;

    const body = await req.json();
    const data = await applyAsAmbulanceProvider(auth.session!.user.id, body);
    return ApiResponse.created(
      serializeAmbulanceDoc(data),
      "Ambulance provider application submitted",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
