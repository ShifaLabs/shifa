import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/features/Auth/auth.config";
import { collections, dbConnect } from "@/lib/dbConnect";
import { assertVideoAccessForAppointment } from "@/features/video/video.permissions";
import { generateVideoToken } from "@/features/video/token.service";
import { getStreamApiKey } from "@/features/video/stream.client";
import {
  buildConsultationLink,
  getJoinWindow,
} from "@/features/video/video.schedule";
import { generateCallId } from "@/features/video/video.service";

const JOINABLE_STATUSES = ["Approved", "Confirmed", "confirmed", "in-progress"];

export async function POST(req: Request) {
  try {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await req.json();
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
