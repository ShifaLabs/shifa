import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import { handleGetDoctorAppointments } from "@/modules/appointment/services/doctor-appointments.service";

export const GET = compose(
  withErrorHandling,
  withRole("doctor"),
  withRateLimit(60, 60_000),
)(handleGetDoctorAppointments);
