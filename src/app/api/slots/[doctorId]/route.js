import { getDoctorSlots } from "@/modules/navigation/doctor/services/doctor-slots.service";

export async function GET(req, context) {
  return getDoctorSlots(req, context);
}
