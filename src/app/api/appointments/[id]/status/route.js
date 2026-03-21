import { patchAppointmentStatus } from "@/modules/appointment/services/appointment-status.service";

export async function PATCH(req, context) {
  return patchAppointmentStatus(req, context);
}
