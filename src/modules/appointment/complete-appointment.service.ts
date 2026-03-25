import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

type CompleteAppointmentPayload = {
  medicines?: string;
  notes?: string;
};

function toCleanText(value: unknown) {
  return String(value || "").trim();
}

export async function completeAppointmentWithSummary(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = String(session.user?.role || "").toLowerCase();
    if (role !== "doctor") {
      return Response.json(
        { error: "Only doctor can complete consultation" },
        { status: 403 },
      );
    }

    const resolvedParams =
      context?.params && typeof (context.params as any)?.then === "function"
        ? await (context.params as Promise<{ id: string }>)
        : (context.params as { id: string });

    const appointmentId = resolvedParams?.id;

    if (!appointmentId || !ObjectId.isValid(appointmentId)) {
      return Response.json(
        { error: "Invalid appointment id" },
        { status: 400 },
      );
    }

    const body = (await req.json()) as CompleteAppointmentPayload;
    const medicines = toCleanText(body?.medicines);
    const notes = toCleanText(body?.notes);

    if (!medicines && !notes) {
      return Response.json(
        { error: "Please provide medicines or notes before completing call" },
        { status: 400 },
      );
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

    const appointment = await appointmentsCollection.findOne({
      _id: new ObjectId(appointmentId),
    });

    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    const sessionUserId = session.user?.id?.toString?.();
    const sessionDoctorId =
      (session.user as any)?.doctorId?.toString?.() || null;
    const appointmentDoctorId = appointment?.doctor?.toString?.();

    const isDoctorOwner =
      appointmentDoctorId &&
      (appointmentDoctorId === sessionUserId ||
        (sessionDoctorId && appointmentDoctorId === sessionDoctorId));

    if (!isDoctorOwner) {
      return Response.json(
        { error: "Only assigned doctor can complete this consultation" },
        { status: 403 },
      );
    }

    const now = new Date();
    const updateDoc: any = {
      $set: {
        status: "Completed",
        updatedAt: now,
        consultationSummary: {
          medicines,
          notes,
          submittedAt: now,
          submittedBy: sessionUserId || null,
        },
        "videoSession.endedAt": now,
      },
      $push: {
        auditTrail: {
          action: "Consultation completed by doctor",
          performedBy: "Doctor",
          from: appointment.status,
          to: "Completed",
          at: now,
        },
      },
    };

    await appointmentsCollection.updateOne({ _id: appointment._id }, updateDoc);

    return Response.json({
      ok: true,
      message: "Consultation completed and summary saved",
    });
  } catch (error) {
    console.error("completeAppointmentWithSummary failed", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
