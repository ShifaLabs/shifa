import { authOptions } from "@/features/Auth/auth.config";
import { AppointmentStatus } from "@/lib/appointmentStateMachine";
import { collections, dbConnect } from "@/lib/dbConnect";
import { generateTimeSlots } from "@/lib/generateTimeSlots";
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

    // Validate ObjectIds
    if (!ObjectId.isValid(patient) || !ObjectId.isValid(doctor)) {
      return Response.json(
        { error: "Invalid patient or doctor ID" },
        { status: 400 },
      );
    }

    // Convert appointmentDate safely
    const appointmentDateObj = new Date(appointmentDate);

    if (isNaN(appointmentDateObj.getTime())) {
      return Response.json(
        { error: "Invalid appointment date" },
        { status: 400 },
      );
    }

    // Unique Compound Index : dataKey and timeSlot
    const dateKey = appointmentDateObj.toISOString().split("T")[0];

    const hours = String(appointmentDateObj.getHours()).padStart(2, "0");
    const minutes = String(appointmentDateObj.getMinutes()).padStart(2, "0");
    const timeSlot = `${hours}:${minutes}`;

    // Prevent past booking
    if (appointmentDateObj <= new Date()) {
      return Response.json(
        { error: "Cannot book appointment in the past" },
        { status: 400 },
      );
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

    const countersCollection = await dbConnect(collections.COUNTERS);

    // AUTO EXPIRE OLD PENDING PAYMENTS (15 minutes rule)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    await appointmentsCollection.updateMany(
      {
        status: "PendingPayment",
        paymentStatus: "unpaid",
        createdAt: { $lte: fifteenMinutesAgo },
      },
      {
        $set: {
          status: "Expired",
          updatedAt: new Date(),
        },
        $push: {
          auditTrail: {
            action: "Auto Expired",
            performedBy: "System",
            from: "PendingPayment",
            to: "Expired",
            at: new Date(),
          },
        },
      },
    );

    // Prevent double booking (SAFE RANGE CHECK)
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

    // Time slots validation
    const validSlots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
      appointmentDateObj,
    );

    if (!validSlots.includes(timeSlot)) {
      return Response.json(
        { error: "Invalid time slot selection" },
        { status: 400 },
      );
    }

    // AUTO-INCREMENT COUNTER (Atomic)
    const counterResult = await countersCollection.findOneAndUpdate(
      { _id: "appointment" },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    const sequenceNumber = counterResult.seq;

    // Generate Public Appointment ID
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

    const appointmentId = `SHF-${datePart}-${sequenceNumber
      .toString()
      .padStart(5, "0")}`;

    // Final Appointment Object
    const newAppointment = {
      appointmentId,
      patient: new ObjectId(patient),
      doctor: new ObjectId(doctor),
      appointmentDate: appointmentDateObj,
      dateKey,
      timeSlot,
      status: AppointmentStatus.PendingPayment,
      consultationType,
      symptoms,
      meetingLink: `https://meet.telemedapp.com/session/${crypto.randomUUID()}`,
      paymentStatus: "unpaid",
      createdAt: new Date(),
      updatedAt: new Date(),
      auditTrail: [
        {
          action: "Appointment Created",
          performedBy: "Patient",
          from: null,
          to: AppointmentStatus.PendingPayment,
          at: new Date(),
        },
      ],
    };

    let result;

    try {
      result = await appointmentsCollection.insertOne(newAppointment);
    } catch (err) {
      if (err.code === 11000) {
        return Response.json(
          { error: "This time slot is already booked" },
          { status: 409 },
        );
      }
      throw err;
    }

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
