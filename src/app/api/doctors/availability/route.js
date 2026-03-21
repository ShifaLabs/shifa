import { updateDoctorAvailability } from "@/modules/doctor/services/doctor-availability.service";

export async function PUT(req) {
  return updateDoctorAvailability(req);
}
