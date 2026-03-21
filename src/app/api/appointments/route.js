import { createAppointment } from "@/modules/appointment/create-appointment.service";

export async function POST(req) {
  return createAppointment(req);
}
