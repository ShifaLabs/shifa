export function generateTimeSlots(
  startTime,
  endTime,
  duration,
  baseDate,
  options = {},
) {
  const slots = [];
  const useUtc = options.useUtc === true;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = new Date(baseDate);
  if (useUtc) {
    start.setUTCHours(startHour, startMinute, 0, 0);
  } else {
    start.setHours(startHour, startMinute, 0, 0);
  }

  const end = new Date(baseDate);
  if (useUtc) {
    end.setUTCHours(endHour, endMinute, 0, 0);
  } else {
    end.setHours(endHour, endMinute, 0, 0);
  }

  while (start < end) {
    const hours = String(
      useUtc ? start.getUTCHours() : start.getHours(),
    ).padStart(2, "0");
    const minutes = String(
      useUtc ? start.getUTCMinutes() : start.getMinutes(),
    ).padStart(2, "0");

    slots.push(`${hours}:${minutes}`);
    if (useUtc) {
      start.setUTCMinutes(start.getUTCMinutes() + duration);
    } else {
      start.setMinutes(start.getMinutes() + duration);
    }
  }

  return slots;
}
