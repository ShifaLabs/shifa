import { parseUtcDate } from "@/modules/appointment/appointment-policy";

export const DASHBOARD_STATUS_LABELS = {
  pendingpayment: "Pending Payment",
  approved: "Pending Confirmation",
  confirmed: "Confirmed",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No-show",
  expired: "Expired",
  scheduled: "Scheduled",
};

export function normalizeStatus(status) {
  const key = String(status || "")
    .trim()
    .toLowerCase();
  return DASHBOARD_STATUS_LABELS[key] || "Unknown";
}

export function getStatusVariant(status) {
  const key = String(status || "")
    .trim()
    .toLowerCase();

  if (key === "completed") return "default";
  if (key === "confirmed" || key === "in-progress") return "secondary";
  if (key === "approved" || key === "pendingpayment") return "outline";
  if (key === "cancelled" || key === "expired" || key === "no-show") {
    return "destructive";
  }

  return "outline";
}

export function toSafeDate(value) {
  return parseUtcDate(value);
}

export function isSameCalendarDay(date, compareDate = new Date()) {
  if (!date) return false;

  return (
    date.getFullYear() === compareDate.getFullYear() &&
    date.getMonth() === compareDate.getMonth() &&
    date.getDate() === compareDate.getDate()
  );
}

export function getDateBucket(date, now = new Date()) {
  if (!date) return "unknown";

  if (isSameCalendarDay(date, now)) {
    return "today";
  }

  const msDiff = date.getTime() - now.getTime();
  const dayDiff = msDiff / (1000 * 60 * 60 * 24);

  if (dayDiff > 0 && dayDiff <= 7) {
    return "next7days";
  }

  if (dayDiff > 7) {
    return "upcoming";
  }

  return "past";
}

export function decorateAppointment(appointment, now = new Date()) {
  const appointmentDate = toSafeDate(appointment?.appointmentDate);
  const rawStatus = String(appointment?.status || "").trim();
  const normalizedStatus = normalizeStatus(rawStatus);
  const statusKey = rawStatus.toLowerCase();

  return {
    ...appointment,
    appointmentDateObject: appointmentDate,
    statusKey,
    normalizedStatus,
    dateBucket: getDateBucket(appointmentDate, now),
    patientName:
      appointment?.patientInfo?.fullName?.trim() || "Unknown Patient",
  };
}

export function computeKpis(appointments) {
  return {
    today: appointments.filter((item) => item.dateBucket === "today").length,
    upcoming: appointments.filter(
      (item) =>
        item.dateBucket === "today" ||
        item.dateBucket === "next7days" ||
        item.dateBucket === "upcoming",
    ).length,
    completed: appointments.filter((item) => item.statusKey === "completed")
      .length,
    noShow: appointments.filter((item) => item.statusKey === "no-show").length,
    pendingConfirmations: appointments.filter(
      (item) => item.statusKey === "approved",
    ).length,
  };
}

export function sortByAppointmentDateAsc(items) {
  return [...items].sort((a, b) => {
    const first = a?.appointmentDateObject?.getTime?.() || 0;
    const second = b?.appointmentDateObject?.getTime?.() || 0;
    return first - second;
  });
}

export function getNextPatient(appointments, now = new Date()) {
  const sorted = sortByAppointmentDateAsc(appointments);

  return (
    sorted.find((item) => {
      const date = item?.appointmentDateObject;
      if (!date) return false;
      return date.getTime() >= now.getTime();
    }) || null
  );
}

export function formatDateTime(value) {
  const date = toSafeDate(value);

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

export function getCountdownLabel(targetDate, now = new Date()) {
  if (!targetDate) return "No upcoming call";

  const delta = targetDate.getTime() - now.getTime();

  if (delta <= 0) {
    return "Call can start now";
  }

  const totalSeconds = Math.floor(delta / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

export function matchesSearch(appointment, query) {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return true;

  const patientName = String(appointment?.patientName || "").toLowerCase();
  const email = String(appointment?.patientInfo?.email || "").toLowerCase();

  return patientName.includes(q) || email.includes(q);
}

export function matchesStatus(appointment, statusFilter) {
  if (!statusFilter || statusFilter === "all") return true;

  if (statusFilter === "today") {
    return appointment.dateBucket === "today";
  }

  if (statusFilter === "upcoming") {
    return (
      appointment.dateBucket === "today" ||
      appointment.dateBucket === "next7days" ||
      appointment.dateBucket === "upcoming"
    );
  }

  return appointment.statusKey === statusFilter;
}

export function matchesDateBucket(appointment, dateFilter) {
  if (!dateFilter || dateFilter === "all") return true;
  return appointment.dateBucket === dateFilter;
}

export function deriveErrorMessage(payload) {
  if (!payload) return "Failed to load doctor dashboard.";
  if (typeof payload?.message === "string") return payload.message;
  if (typeof payload?.error === "string") return payload.error;
  return "Failed to load doctor dashboard.";
}

export function getInitials(name) {
  const clean = String(name || "").trim();
  if (!clean) return "NA";

  const parts = clean.split(" ").filter(Boolean);
  const first = parts[0]?.charAt(0) || "";
  const second = parts[1]?.charAt(0) || "";
  return `${first}${second}`.toUpperCase();
}
