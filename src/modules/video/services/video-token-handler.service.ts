import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { assertVideoAccessForAppointment } from "@/modules/video/video.permissions";
import { generateVideoToken } from "@/modules/video/token.service";
import { getStreamApiKey } from "@/modules/video/stream.client";
import { createCall, generateCallId } from "@/modules/video/video.service";
import {
  buildConsultationLink,
  getJoinWindow,
} from "@/modules/video/video.schedule";

const JOINABLE_STATUSES = ["Approved", "Confirmed", "confirmed", "in-progress"];

export async function createVideoToken(req: Request) {
  try {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let appointmentId: string | undefined;
    const rawBody = await req.text();

    if (rawBody.trim().length > 0) {
      try {
        const parsedBody = JSON.parse(rawBody) as { appointmentId?: unknown };
        if (typeof parsedBody.appointmentId === "string") {
          appointmentId = parsedBody.appointmentId;
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON body" },
          { status: 400 },
        );
      }
    }

    if (!ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: "Invalid appointment id" },
        { status: 400 },
      );
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
    const appointment = await appointmentsCollection.findOne({
      _id: new ObjectId(appointmentId),
    });

    const access = assertVideoAccessForAppointment(session, appointment);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status },
      );
    }

    const isPaidVideoConsultation =
      appointment.consultationType === "video" &&
      appointment.paymentStatus === "paid";
    const canBypassRestrictions = isDevelopment;

    if (
      !JOINABLE_STATUSES.includes(appointment.status) &&
      !isPaidVideoConsultation &&
      !canBypassRestrictions
    ) {
      return NextResponse.json(
        { error: "Consultation is not available for this appointment status" },
        { status: 403 },
      );
    }

    const now = new Date();
    const persistedJoinFrom = appointment.videoSession?.joinFrom;
    const persistedJoinUntil = appointment.videoSession?.joinUntil;
    const fallbackWindow = getJoinWindow(appointment.appointmentDate);
    const joinFrom = persistedJoinFrom
      ? new Date(persistedJoinFrom)
      : fallbackWindow.joinFrom;
    const joinUntil = persistedJoinUntil
      ? new Date(persistedJoinUntil)
      : fallbackWindow.joinUntil;

    if (
      (now < joinFrom || now > joinUntil) &&
      !isPaidVideoConsultation &&
      !canBypassRestrictions
    ) {
      return NextResponse.json(
        {
          error:
            "Consultation can only be joined from 10 minutes before until 60 minutes after appointment time.",
        },
        { status: 403 },
      );
    }

    let callId = appointment.videoSession?.callId;
    if (!callId) {
      if (
        appointment.consultationType !== "video" ||
        appointment.paymentStatus !== "paid"
      ) {
        if (!canBypassRestrictions) {
          return NextResponse.json(
            { error: "Video session not initialized for this appointment" },
            { status: 409 },
          );
        }
      }

      const generatedCallId = generateCallId(appointment._id.toString());
      const fallbackJoinWindow = getJoinWindow(appointment.appointmentDate);

      const updateDoc: any = {
        $set: {
          videoSession: {
            provider: "stream",
            ...(appointment.videoSession || {}),
            callId: generatedCallId,
            meetingLink: buildConsultationLink(appointment._id.toString()),
            joinFrom:
              appointment.videoSession?.joinFrom || fallbackJoinWindow.joinFrom,
            joinUntil:
              appointment.videoSession?.joinUntil ||
              fallbackJoinWindow.joinUntil,
            createdAt: appointment.videoSession?.createdAt || new Date(),
          },
          updatedAt: new Date(),
        },
        $push: {
          auditTrail: {
            action: "Video session auto-initialized",
            performedBy: "System",
            from: appointment.status,
            to: appointment.status,
            at: new Date(),
          },
        },
      };

      await appointmentsCollection.updateOne(
        { _id: appointment._id },
        updateDoc,
      );
      callId = generatedCallId;
    }

    const usersCollection = await dbConnect(collections.USERS);
    const doctorsCollection = await dbConnect(collections.DOCTORS);

    const [patientUser, doctorProfile] = await Promise.all([
      usersCollection.findOne({ _id: appointment.patient }),
      doctorsCollection.findOne({ _id: appointment.doctor }),
    ]);

    let doctorUser = await usersCollection.findOne({
      doctorId: appointment.doctor,
    });

    if (!doctorUser && doctorProfile?.email) {
      doctorUser = await usersCollection.findOne({
        email: doctorProfile.email.toLowerCase(),
      });
    }

    const patientUserId =
      appointment.patient?.toString?.() || appointment.patientId?.toString?.();
    const doctorUserId =
      doctorUser?._id?.toString?.() ||
      appointment.doctor?.toString?.() ||
      appointment.doctorId?.toString?.();

    if (!patientUserId || !doctorUserId) {
      return NextResponse.json(
        { error: "Unable to resolve consultation participants" },
        { status: 409 },
      );
    }

    await createCall({
      callId,
      appointmentId: appointment._id.toString(),
      createdByUserId: session.user.id,
      doctorId: doctorUserId,
      patientId: patientUserId,
      createdByName: session.user.name || "Shifa User",
      doctorName: doctorUser?.fullName || doctorProfile?.fullName,
      patientName:
        patientUser?.fullName || appointment?.payment?.customer?.name,
    });

    const token = generateVideoToken(session.user.id);
    const apiKey = getStreamApiKey();

    return NextResponse.json({
      apiKey,
      token,
      callId,
      userId: session.user.id,
      userName: session.user.name || "Shifa User",
      userRole: session.user.role || "unknown",
    });
  } catch (error) {
    console.error("POST /api/video/token failed", error);
    const isDevelopment = process.env.NODE_ENV !== "production";
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: isDevelopment ? message : "Internal server error" },
      { status: 500 },
    );
  }
}
