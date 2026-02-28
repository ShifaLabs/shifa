import { authOptions } from "@/features/Auth/auth.config";
import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patient = session.user.id;
    const body = await req.json();

    const { doctor, appointmentDate, consultationType, symptoms } = body;

    // ✅ Validate ObjectIds
    if (!ObjectId.isValid(patient) || !ObjectId.isValid(doctor)) {
      return Response.json(
        { error: "Invalid patient or doctor ID" },
        { status: 400 },
      );
    }

    // ✅ Convert appointmentDate safely
    const appointmentDateObj = new Date(appointmentDate);

    if (isNaN(appointmentDateObj.getTime())) {
      return Response.json(
        { error: "Invalid appointment date" },
        { status: 400 },
      );
    }

    // ✅ Prevent past booking
    if (appointmentDateObj <= new Date()) {
      return Response.json(
        { error: "Cannot book appointment in the past" },
        { status: 400 },
      );
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

    const countersCollection = await dbConnect(collections.COUNTERS);

    // 🔒 Prevent double booking (SAFE RANGE CHECK)
    const dayOfWeek = appointmentDateObj.getDay();

    const availabilityCollection = await dbConnect(
      collections.DOCTOR_AVAILABILITIES,
    );

    const availability = await availabilityCollection.findOne({
      doctorId: new ObjectId(doctor),
      dayOfWeek,
      isActive: true,
    });
    if (!availability) {
      return Response.json(
        { error: "Doctor is not available on this day" },
        { status: 400 },
      );
    }
    const slotDuration = availability?.slotDuration || 30;

    const start = new Date(appointmentDateObj);
    const end = new Date(appointmentDateObj);
    end.setMinutes(end.getMinutes() + slotDuration);

    const existing = await appointmentsCollection.findOne({
      doctor: new ObjectId(doctor),
      appointmentDate: {
        $gte: start,
        $lt: end,
      },
      status: { $in: ["pending", "confirmed"] },
    });

    if (existing) {
      return Response.json(
        { error: "This time slot is already booked" },
        { status: 409 },
      );
    }

    // 🔥 AUTO-INCREMENT COUNTER (Atomic)
    const counterResult = await countersCollection.findOneAndUpdate(
      { _id: "appointment" },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    const sequenceNumber = counterResult.seq;

    // 📅 Generate Public Appointment ID
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

    const appointmentId = `SHF-${datePart}-${sequenceNumber
      .toString()
      .padStart(5, "0")}`;

    // ✅ Final Appointment Object
    const newAppointment = {
      appointmentId,
      patient: new ObjectId(patient),
      doctor: new ObjectId(doctor),
      appointmentDate: appointmentDateObj,
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
      appointmentId,
    });
  } catch (error) {
    console.error("Appointment POST error:", error);

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
