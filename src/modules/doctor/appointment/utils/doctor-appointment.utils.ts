import type {
  AppointmentStatusKey,
  AppointmentTab,
  DoctorAppointment,
  DoctorAppointmentRaw,
  PaymentStatusKey,
} from "../types/doctor-appointment.types";

const TERMINAL_STATUS = new Set<AppointmentStatusKey>([
  "completed",
  "cancelled",
  "no-show",
  "expired",
]);

export const APPOINTMENT_TABS: Array<{ key: AppointmentTab; label: string }> = [
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no-show", label: "No-show" },
];

export const STATUS_LABEL_MAP: Record<AppointmentStatusKey, string> = {
  pendingpayment: "Pending Payment",
  approved: "Pending Confirmation",
  confirmed: "Confirmed",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
  expired: "Expired",
  scheduled: "Scheduled",
  unknown: "Unknown",
};

export function toStatusKey(value: string | undefined): AppointmentStatusKey {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (
    normalized === "pendingpayment" ||
    normalized === "approved" ||
    normalized === "confirmed" ||
    normalized === "in-progress" ||
    normalized === "completed" ||
    normalized === "cancelled" ||
    normalized === "no-show" ||
    normalized === "expired" ||
    normalized === "scheduled"
  ) {
    return normalized;
  }

  return "unknown";
}

export function toPaymentStatusKey(
  value: string | undefined,
): PaymentStatusKey {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "paid") return "paid";
  if (normalized === "unpaid") return "unpaid";
  return "unknown";
}

export function getStatusBadgeVariant(statusKey: AppointmentStatusKey) {
  if (statusKey === "completed") return "default";
  if (statusKey === "confirmed" || statusKey === "in-progress") {
    return "secondary";
  }
  if (statusKey === "approved" || statusKey === "pendingpayment") {
    return "outline";
  }
  if (
    statusKey === "cancelled" ||
    statusKey === "no-show" ||
    statusKey === "expired"
  ) {
    return "destructive";
  }

  return "outline";
}

export function normalizeDoctorAppointment(
  raw: DoctorAppointmentRaw,
): DoctorAppointment {
  const appointmentDate =
    raw.appointmentDate &&
    !Number.isNaN(new Date(raw.appointmentDate).getTime())
      ? new Date(raw.appointmentDate)
      : null;
  const now = new Date();

  let dateBucket: DoctorAppointment["dateBucket"] = "unknown";

  if (appointmentDate) {
    const sameDay =
      appointmentDate.getFullYear() === now.getFullYear() &&
      appointmentDate.getMonth() === now.getMonth() &&
      appointmentDate.getDate() === now.getDate();

    if (sameDay) {
      dateBucket = "today";
    } else if (appointmentDate.getTime() > now.getTime()) {
      dateBucket = "future";
    } else {
      dateBucket = "past";
    }
  }

  const statusKey = toStatusKey(raw.status);

  return {
    _id: String(raw._id || ""),
    appointmentId: String(raw.appointmentId || raw._id || ""),
    appointmentDate: String(raw.appointmentDate || ""),
    appointmentDateObject: appointmentDate,
    dateBucket,
    status: String(raw.status || "unknown"),
    statusKey,
    statusLabel: STATUS_LABEL_MAP[statusKey],
    paymentStatus: String(raw.paymentStatus || "unknown"),
    paymentStatusKey: toPaymentStatusKey(raw.paymentStatus),
    consultationType: String(raw.consultationType || "consultation"),
    symptoms: String(raw.symptoms || "").trim(),
    consultationSummary: {
      medicines: String(raw.consultationSummary?.medicines || "").trim(),
      notes: String(raw.consultationSummary?.notes || "").trim(),
      submittedAt: raw.consultationSummary?.submittedAt,
      submittedBy: raw.consultationSummary?.submittedBy || null,
    },
    patientInfo: {
      _id: raw.patientInfo?._id ?? null,
      fullName: String(raw.patientInfo?.fullName || "Unknown Patient"),
      email: String(raw.patientInfo?.email || ""),
      phone: String(raw.patientInfo?.phone || ""),
      profileImage: String(raw.patientInfo?.profileImage || "").trim(),
    },
    videoSession: {
      provider: raw.videoSession?.provider,
      callId: raw.videoSession?.callId,
      meetingLink: raw.videoSession?.meetingLink,
      joinFrom: raw.videoSession?.joinFrom,
      joinUntil: raw.videoSession?.joinUntil,
    },
  };
}

export function sortAppointmentsByDate(appointments: DoctorAppointment[]) {
  return [...appointments].sort((a, b) => {
    const first = a.appointmentDateObject?.getTime() ?? 0;
    const second = b.appointmentDateObject?.getTime() ?? 0;
    return first - second;
  });
}

export function formatDateTime(date: Date | null) {
  if (!date) {
    return { date: "Unknown date", time: "Unknown time" };
  }

  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function getPaymentLabel(paymentStatus: PaymentStatusKey) {
  if (paymentStatus === "paid") return "Paid";
  if (paymentStatus === "unpaid") return "Unpaid";
  return "Unknown";
}

export function canConfirmAppointment(appointment: DoctorAppointment) {
  return appointment.statusKey === "approved";
}

export function canCancelAppointment(appointment: DoctorAppointment) {
  return !TERMINAL_STATUS.has(appointment.statusKey);
}

export function canMarkNoShow(appointment: DoctorAppointment) {
  const date = appointment.appointmentDateObject;
  if (!date) return false;

  return appointment.statusKey === "confirmed" && date.getTime() < Date.now();
}

export function canJoinVideoCall(appointment: DoctorAppointment) {
  if (appointment.consultationType.toLowerCase() !== "video") {
    return false;
  }

  if (!appointment._id) return false;

  return (
    appointment.statusKey === "confirmed" ||
    appointment.statusKey === "in-progress" ||
    appointment.statusKey === "approved"
  );
}

export function filterByTab(
  appointments: DoctorAppointment[],
  activeTab: AppointmentTab,
) {
  if (activeTab === "today") {
    return appointments.filter((item) => item.dateBucket === "today");
  }

  if (activeTab === "upcoming") {
    return appointments.filter(
      (item) =>
        item.dateBucket === "future" && !TERMINAL_STATUS.has(item.statusKey),
    );
  }

  if (activeTab === "completed") {
    return appointments.filter((item) => item.statusKey === "completed");
  }

  if (activeTab === "cancelled") {
    return appointments.filter(
      (item) => item.statusKey === "cancelled" || item.statusKey === "expired",
    );
  }

  return appointments.filter((item) => item.statusKey === "no-show");
}

export function filterBySearch(
  appointments: DoctorAppointment[],
  searchValue: string,
) {
  const query = searchValue.trim().toLowerCase();
  if (!query) return appointments;

  return appointments.filter((item) => {
    const name = item.patientInfo.fullName.toLowerCase();
    const email = item.patientInfo.email.toLowerCase();
    return name.includes(query) || email.includes(query);
  });
}

export function getInitials(fullName: string) {
  const parts = String(fullName || "")
    .trim()
    .split(" ")
    .filter(Boolean);
  const first = parts[0]?.[0] || "N";
  const second = parts[1]?.[0] || "A";
  return `${first}${second}`.toUpperCase();
}

export function getReadableStatus(status?: string) {
  const key = toStatusKey(status);
  return STATUS_LABEL_MAP[key] || "Unknown";
}
