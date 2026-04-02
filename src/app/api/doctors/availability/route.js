import { updateDoctorAvailability } from "@/modules/navigation/doctor/services/doctor-availability.service";

export async function PUT(req) {
  return updateDoctorAvailability(req);
}
