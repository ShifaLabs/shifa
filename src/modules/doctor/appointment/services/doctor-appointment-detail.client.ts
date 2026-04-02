import type {
  DoctorAppointmentDetailApiResponse,
  DoctorAppointmentDetailResponse,
  SaveFollowUpPayload,
} from "../types/doctor-appointment-detail.types";
import {
  normalizeAuditTrail,
  normalizeFollowUps,
  sanitizeFollowUpDraft,
} from "../utils/doctor-appointment-detail.utils";

function toErrorMessage(payload: DoctorAppointmentDetailApiResponse | null) {
  if (!payload) return "Failed to load appointment detail.";
  if (typeof payload.error === "string") return payload.error;
  if (typeof payload.message === "string") return payload.message;
  return "Failed to load appointment detail.";
}

export async function fetchDoctorAppointmentDetail(
  appointmentId: string,
): Promise<DoctorAppointmentDetailResponse> {
  const response = await fetch(`/api/appointments/doctor/${appointmentId}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as DoctorAppointmentDetailApiResponse;

  if (!response.ok || !payload?.success || !payload?.data) {
    throw new Error(toErrorMessage(payload || null));
  }

  return {
    appointment: {
      ...payload.data.appointment,
      auditTrail: normalizeAuditTrail(
        payload.data.appointment.auditTrail || [],
      ),
    },
    followUps: normalizeFollowUps(payload.data.followUps || []),
    videoReadiness: payload.data.videoReadiness,
  };
}

export async function saveDoctorAppointmentFollowUp(
  appointmentId: string,
  draft: SaveFollowUpPayload,
): Promise<void> {
  const payload = sanitizeFollowUpDraft(draft);

  const response = await fetch(`/api/appointments/${appointmentId}/follow-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { error?: string; message?: string };

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Failed to save follow-up.",
    );
  }
}
