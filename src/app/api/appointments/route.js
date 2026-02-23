import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(req) {
  const body = await req.json();

  const { patient, doctor, appointmentDate, consultationType, symptoms } = body;

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const newAppointment = {
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
    appointmentId: result.insertedId,
  });
}
