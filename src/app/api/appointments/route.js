import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const body = await req.json();

  const { patient, doctor, appointmentDate, consultationType, symptoms } = body;

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const countersCollection = await dbConnect(collections.COUNTERS);

  // ✅ Validate ObjectIds
  if (!ObjectId.isValid(patient) || !ObjectId.isValid(doctor)) {
    throw new Error("Invalid patient or doctor ID");
  }

  // ❌ Prevent past booking
  if (appointmentDate < new Date()) {
    throw new Error("Cannot book appointment in the past");
  }

  // 🔒 Check double booking for same doctor & time
  const existing = await appointmentsCollection.findOne({
    doctor: new ObjectId(doctor),
    appointmentDate,
    status: { $in: ["pending", "confirmed"] },
  });

  if (existing) {
    throw new Error("This time slot is already booked");
  }

  // 🔥 AUTO-INCREMENT (Atomic)
  const counter = await countersCollection.findOneAndUpdate(
    { _id: "appointment" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  const sequenceNumber = counter.value?.seq ?? 1;

  // 📅 Format date part
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

  // 🎟 Public Appointment ID
  const appointmentId = `SHF-${datePart}-${sequenceNumber
    .toString()
    .padStart(5, "0")}`;

  const newAppointment = {
    appointmentId: appointmentId,
    patient: new ObjectId(patient),
    doctor: new ObjectId(doctor),
    appointmentDate: new Date(appointmentDate),
    status: "pending",
    consultationType,
    symptoms,
    meetingLink: `https://meet.telemedapp.com/session/${crypto.randomUUID()}`,
    paymentStatus: "unpaid",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await appointmentsCollection.insertOne(newAppointment);

  return Response.json({
    message: "Appointment created successfully",
    insertedId: result.insertedId,
    appointmentId: appointmentId,
  });
}
