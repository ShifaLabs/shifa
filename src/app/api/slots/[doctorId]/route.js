import { collections, dbConnect } from "@/lib/dbConnect";
import { generateTimeSlots } from "@/lib/generateTimeSlots";
import { ObjectId } from "mongodb";

export async function GET(req, context) {
  const { doctorId } = await context.params;

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return Response.json({ error: "Date is required" }, { status: 400 });
  }

  const availabilityCollection = await dbConnect(
    collections.DOCTOR_AVAILABILITIES,
  );

  // Convert date → dayOfWeek
  const selectedDate = new Date(date + "T00:00:00");
  selectedDate.setHours(0, 0, 0, 0);
  const dayOfWeek = selectedDate.getDay(); // 0-6

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
  );

  // Get appointments collection
  const appointmentCollection = await dbConnect(collections.APPOINTMENTS);

  // Create start & end of selected date
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Find booked appointments for that doctor & date
  const bookedAppointments = await appointmentCollection
    .find({
      doctor: new ObjectId(doctorId),
      dateKey: date,
      status: {
        $in: ["PendingPayment", "Confirmed", "Approved"],
      },
    })
    .toArray();

  // Extract booked times
  const bookedTimes = bookedAppointments.map((appt) => {
    const hours = String(new Date(appt.appointmentDate).getHours()).padStart(
      2,
      "0",
    );
    const minutes = String(
      new Date(appt.appointmentDate).getMinutes(),
    ).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  const now = new Date();

  // Remove past slots if today
  slots = slots.filter((slot) => {
    const [hour, minute] = slot.split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, minute, 0);
    return slotDate > now;
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
