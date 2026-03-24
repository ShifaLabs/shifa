import { dbConnect, collections } from "@/infrastructure/db/dbConnect";
import { generateTimeSlots } from "@/infrastructure/lib/legacy/generateTimeSlots";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const { doctorId, availability } = await req.json();

  const appointmentCollection = await dbConnect(collections.APPOINTMENTS);

  const availabilityMap = {};

  availability.forEach((day) => {
    availabilityMap[day.dayOfWeek] = day;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // next 7 days
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 6);

  const appointments = await appointmentCollection
    .find({
      doctor: new ObjectId(doctorId),
      appointmentDate: {
        $gte: today,
        $lte: nextWeek,
      },
      status: {
        $in: ["Confirmed", "Approved"],
      },
    })
    .toArray();

  const grouped = {};

  appointments.forEach((appt) => {
    const date = new Date(appt.appointmentDate);
    const day = date.getDay();

    const time = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;

    const config = availabilityMap[day];
    const appointmentSlot = appt.slotDuration;

    // If day is disabled → conflict
    if (!config || !config.enabled) {
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(time);
      return;
    }

    // Check time range
    if (time < config.startTime || time > config.endTime) {
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(time);
      return;
    }

    // SLOT GRID VALIDATION
    const validSlots = generateTimeSlots(
      config.startTime,
      config.endTime,
      config.slotDuration,
      date,
    );

    if (!validSlots.includes(time)) {
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(time);
      return;
    }

    // NEW: SLOT DURATION CHANGE WARNING
    if (appointmentSlot && appointmentSlot !== config.slotDuration) {
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(time);
    }
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const conflicts = Object.keys(grouped).map((day) => ({
    dayOfWeek: Number(day),
    dayLabel: dayLabels[day],
    times: grouped[day],
  }));

  return Response.json({ conflicts });
}
