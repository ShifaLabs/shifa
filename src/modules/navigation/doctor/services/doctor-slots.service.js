import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { generateTimeSlots } from "@/infrastructure/lib/legacy/generateTimeSlots";
import {
  buildUtcDateFromDateKeyAndTime,
  getUtcDayOfWeek,
  getUtcTimeSlot,
  OCCUPYING_APPOINTMENT_STATUSES,
} from "@/modules/appointment/appointment-policy";
import { ObjectId } from "mongodb";

export async function getDoctorSlots(req, context) {
  const { doctorId } = await context.params;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return Response.json({ error: "Date is required" }, { status: 400 });
  }

  const availabilityCollection = await dbConnect(
    collections.DOCTOR_AVAILABILITIES,
  );

  const selectedDate = new Date(`${date}T00:00:00.000Z`);
  selectedDate.setUTCHours(0, 0, 0, 0);

  if (Number.isNaN(selectedDate.getTime())) {
    return Response.json({ error: "Invalid date" }, { status: 400 });
  }

  const dayOfWeek = getUtcDayOfWeek(selectedDate);

  const availability = await availabilityCollection.findOne({
    doctorId: new ObjectId(doctorId),
    dayOfWeek,
    isActive: true,
  });

  if (!availability) {
    return Response.json({
      offDay: true,
      slots: [],
    });
  }

  let slots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration,
    selectedDate,
    { useUtc: true },
  );

  const appointmentCollection = await dbConnect(collections.APPOINTMENTS);

  const bookedAppointments = await appointmentCollection
    .find({
      doctor: new ObjectId(doctorId),
      dateKey: date,
      status: {
        $in: OCCUPYING_APPOINTMENT_STATUSES,
      },
    })
    .toArray();

  const bookedTimes = bookedAppointments.map((appt) =>
    getUtcTimeSlot(new Date(appt.appointmentDate)),
  );

  const now = new Date();

  slots = slots.filter((slot) => {
    const slotDate = buildUtcDateFromDateKeyAndTime(date, slot);
    return slotDate && slotDate > now;
  });

  const finalSlots = slots.map((slot) => ({
    time: slot,
    isBooked: bookedTimes.includes(slot),
  }));

  return Response.json({
    offDay: false,
    slots: finalSlots,
  });
}
