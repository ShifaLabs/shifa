export function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  let [startHour, startMinute] = startTime.split(":").map(Number);
  let [endHour, endMinute] = endTime.split(":").map(Number);

  const start = new Date();
  start.setHours(startHour, startMinute, 0);

  const end = new Date();
  end.setHours(endHour, endMinute, 0);

  while (start < end) {
    const hours = String(start.getHours()).padStart(2, "0");
    const minutes = String(start.getMinutes()).padStart(2, "0");

    slots.push(`${hours}:${minutes}`);
    start.setMinutes(start.getMinutes() + duration);
  }

  return slots;
}
