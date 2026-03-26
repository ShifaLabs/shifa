import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import { handleGetDoctorReportsStatusDistribution } from "@/modules/doctor/reports/service/doctor.report.service";

export const GET = compose(
  withErrorHandling,
  withRole("doctor"),
  withRateLimit(60, 60_000),
)(handleGetDoctorReportsStatusDistribution);
