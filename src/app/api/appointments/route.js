import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const body = await req.json();

    const { patient, doctor, appointmentDate, consultationType, symptoms } =
      body;

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
    // We assume 30 min slot. If dynamic, fetch slotDuration instead.
    const start = new Date(appointmentDateObj);
    const end = new Date(appointmentDateObj);
    end.setMinutes(end.getMinutes() + 30);

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
    let counterDoc = await countersCollection.findOne({ _id: "appointment" });

    if (!counterDoc) {
      await countersCollection.insertOne({ _id: "appointment", seq: 1 });
      counterDoc = { seq: 1 };
    } else {
      await countersCollection.updateOne(
        { _id: "appointment" },
        { $inc: { seq: 1 } },
      );
      counterDoc.seq += 1;
    }

    const sequenceNumber = counterDoc.seq;

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
