import { createAppointment } from "@/modules/appointment/services/create-appointment.service";

export async function POST(req) {
  return createAppointment(req);
}
