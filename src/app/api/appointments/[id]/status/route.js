import { patchAppointmentStatus } from "@/modules/appointment/appointment-status.service";

export async function PATCH(req, context) {
  return patchAppointmentStatus(req, context);
}
