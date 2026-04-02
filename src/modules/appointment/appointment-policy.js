export const OCCUPYING_APPOINTMENT_STATUSES = [
  "PendingPayment",
  "Confirmed",
  "Approved",
];

export function parseUtcDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildUtcDateFromDateKeyAndTime(dateKey, timeSlot) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""))) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(String(timeSlot || ""))) {
    return null;
  }

  const parsed = new Date(`${dateKey}T${timeSlot}:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getUtcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function getUtcTimeSlot(date) {
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getUtcDayOfWeek(date) {
  return date.getUTCDay();
}
