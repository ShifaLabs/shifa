import type {
  DoctorAppointment,
  DoctorAppointmentsApiResponse,
} from "../types/doctor-appointment.types";
import {
  normalizeDoctorAppointment,
  sortAppointmentsByDate,
} from "../utils/doctor-appointment.utils";

function getErrorMessage(payload: DoctorAppointmentsApiResponse | null) {
  if (!payload) return "Failed to fetch appointments.";
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return "Failed to fetch appointments.";
}

export async function fetchDoctorAppointments(): Promise<DoctorAppointment[]> {
  const response = await fetch("/api/appointments/doctor", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as DoctorAppointmentsApiResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  const rows = Array.isArray(payload?.data?.appointments)
    ? payload.data.appointments
    : [];

  return sortAppointmentsByDate(rows.map(normalizeDoctorAppointment));
}

export async function patchAppointmentStatus(
  appointmentId: string,
  newStatus: string,
): Promise<void> {
  const response = await fetch(`/api/appointments/${appointmentId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newStatus }),
  });

  let payload: { error?: string; message?: string } | null = null;

  try {
    payload = (await response.json()) as { error?: string; message?: string };
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload?.error || payload?.message || "Status update failed.",
    );
  }
}
