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
    doctorId : new ObjectId(doctorId),
    dayOfWeek,
    isActive: true,
  });

  if (!availability) {
    return Response.json([]);
  }

  let slots = generateTimeSlots(
    availability.startTime,
    availability.endTime,
    availability.slotDuration,
  );

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
    isBooked: false,
  }));

  return Response.json(finalSlots);
}
