import type {
  DoctorAppointmentDetailAuditEvent,
  DoctorAppointmentDetailResponse,
  DoctorFollowUpEntry,
  FollowUpPriority,
} from "../types/doctor-appointment-detail.types";

export function formatDateTimeLabel(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function formatDateLabel(value?: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
}

export function getAddressLabel(
  address?: DoctorAppointmentDetailResponse["appointment"]["patientInfo"]["address"],
) {
  if (!address) return "Address not available";

  const parts = [address.street, address.city, address.country, address.zipCode]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address not available";
}

export function getPriorityBadgeVariant(priority: FollowUpPriority) {
  if (priority === "urgent") return "destructive" as const;
  if (priority === "important") return "secondary" as const;
  return "outline" as const;
}

export function sanitizeFollowUpDraft(payload: {
  instructions: string;
  notes?: string;
  priority: FollowUpPriority;
  nextVisitAt?: string | null;
}) {
  return {
    instructions: String(payload.instructions || "").trim(),
    notes: String(payload.notes || "").trim(),
    priority: payload.priority,
    nextVisitAt: payload.nextVisitAt || null,
  };
}

export function normalizeAuditTrail(
  events: DoctorAppointmentDetailAuditEvent[],
) {
  return [...(events || [])].sort((a, b) => {
    const first = a?.at ? new Date(a.at).getTime() : 0;
    const second = b?.at ? new Date(b.at).getTime() : 0;
    return second - first;
  });
}

export function normalizeFollowUps(entries: DoctorFollowUpEntry[]) {
  return [...(entries || [])].sort((a, b) => {
    const first = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const second = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return second - first;
  });
}

export function getVideoReadinessLabel(
  payload: DoctorAppointmentDetailResponse,
) {
  const readiness = payload.videoReadiness;

  if (!readiness.hasCallId) return "Video call is not prepared yet.";
  if (!readiness.hasMeetingLink) return "Meeting link is not available yet.";
  if (readiness.canJoinNow) return "Ready to join now.";

  if (readiness.joinFrom) {
    return `Join window starts at ${formatDateTimeLabel(readiness.joinFrom)}.`;
  }

  return "Video session is configured.";
}
