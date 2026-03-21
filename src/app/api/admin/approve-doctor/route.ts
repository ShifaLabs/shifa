import { NextRequest } from "next/server";
import {
  approveDoctorApplication,
  listDoctorApprovals,
} from "@/modules/doctor/services/doctor-approval.service";

/**
 * POST /api/admin/approve-doctor
 * Admin endpoint to approve or reject doctor applications
 */
export async function POST(request: NextRequest) {
  return approveDoctorApplication(request);
}

/**
 * GET /api/admin/approve-doctor?status=pending
 * Get list of doctors pending approval
 */
export async function GET(request: NextRequest) {
  return listDoctorApprovals(request);
}
