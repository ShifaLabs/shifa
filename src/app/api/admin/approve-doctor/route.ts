import { NextRequest } from "next/server";
import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import {
  approveDoctorApplication,
  listDoctorApprovals,
} from "@/modules/navigation/doctor/services/doctor-approval.service";

/**
 * POST /api/admin/approve-doctor
 * Admin endpoint to approve or reject doctor applications
 */
async function handleApproveDoctor(request: NextRequest) {
  return approveDoctorApplication(request);
}

/**
 * GET /api/admin/approve-doctor?status=pending
 * Get list of doctors pending approval
 */
async function handleListDoctorApprovals(request: NextRequest) {
  return listDoctorApprovals(request);
}

export const POST = compose(
  withErrorHandling,
  withRole("admin"),
  withRateLimit(30, 60_000),
)(handleApproveDoctor);

export const GET = compose(
  withErrorHandling,
  withRole("admin"),
  withRateLimit(60, 60_000),
)(handleListDoctorApprovals);
