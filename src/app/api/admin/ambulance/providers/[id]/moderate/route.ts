import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { moderateAmbulanceProvider } from "@/modules/ambulance/services/admin.service";
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
    const auth = await requireSession(["admin"]);
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await req.json();
    const data = await moderateAmbulanceProvider(
      id,
      auth.session!.user.id,
      body,
    );
    return ApiResponse.success(
      serializeAmbulanceDoc(data),
      "Ambulance provider moderated",
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
