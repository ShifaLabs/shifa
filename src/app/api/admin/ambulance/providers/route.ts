import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { listAdminAmbulanceProviders } from "@/modules/ambulance/services/admin.service";
import { serializeAmbulanceDoc } from "@/modules/ambulance/infrastructure/ambulance.serializer";
import {
  handleRouteError,
  requireSession,
} from "@/modules/ambulance/services/route-helpers";

export async function GET(req: Request) {
  try {
    const auth = await requireSession(["admin"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const data = await listAdminAmbulanceProviders(
      searchParams.get("status") || undefined,
    );
    return ApiResponse.success(serializeAmbulanceDoc(data));
  } catch (error) {
    return handleRouteError(error);
  }
}
