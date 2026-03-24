import { NextRequest } from "next/server";
import { submitBecomeDoctorApplication } from "@/modules/doctor/services/become-doctor.service";

export async function POST(request: NextRequest) {
  return submitBecomeDoctorApplication(request);
}
