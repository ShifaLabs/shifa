import { NextRequest } from "next/server";
import { submitBecomeDoctorApplication } from "@/modules/navigation/doctor/services/become-doctor.service";

export async function POST(request: NextRequest) {
  return submitBecomeDoctorApplication(request);
}
