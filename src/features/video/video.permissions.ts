import { Session } from "next-auth";

export function assertVideoAccessForAppointment(
  session: Session | null,
  appointment: any,
) {
  if (!session) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  if (!appointment) {
    return { ok: false, status: 404, error: "Appointment not found" };
  }

  const userId = session.user?.id;
  const role = session.user?.role?.toLowerCase?.();
  const sessionDoctorId = (session.user as any)?.doctorId?.toString?.() || null;

  if (!userId || !role) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const doctorId =
    appointment.doctor?.toString?.() || appointment.doctorId?.toString?.();
  const patientId =
    appointment.patient?.toString?.() || appointment.patientId?.toString?.();

  const isDoctorOwner =
    role === "doctor" &&
    (doctorId === userId || (sessionDoctorId && doctorId === sessionDoctorId));
  const isPatientOwner = role === "patient" && patientId === userId;

  if (!isDoctorOwner && !isPatientOwner) {
    return { ok: false, status: 403, error: "Forbidden" };
  }

  return { ok: true, isDoctorOwner, isPatientOwner };
}
