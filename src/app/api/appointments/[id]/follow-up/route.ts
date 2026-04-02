import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import { handleSaveDoctorAppointmentFollowUp } from "@/modules/appointment/doctor-appointments.service";

export const POST = compose(
  withErrorHandling,
  withRole("doctor"),
  withRateLimit(30, 60_000),
)(handleSaveDoctorAppointmentFollowUp);
