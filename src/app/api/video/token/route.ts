import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/features/Auth/auth.config";
import { collections, dbConnect } from "@/lib/dbConnect";
import { assertVideoAccessForAppointment } from "@/features/video/video.permissions";
import { generateVideoToken } from "@/features/video/token.service";
import { getStreamApiKey } from "@/features/video/stream.client";
import { getJoinWindow } from "@/features/video/video.schedule";

const JOINABLE_STATUSES = ["Approved", "Confirmed", "confirmed", "in-progress"];

export async function POST(req: Request) {
  try {
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

    if (!JOINABLE_STATUSES.includes(appointment.status)) {
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

    if (now < joinFrom || now > joinUntil) {
      return NextResponse.json(
        {
          error:
            "Consultation can only be joined from 10 minutes before until 60 minutes after appointment time.",
        },
        { status: 403 },
      );
    }

    const callId = appointment.videoSession?.callId;
    if (!callId) {
      return NextResponse.json(
        { error: "Video session not initialized for this appointment" },
        { status: 409 },
      );
    }

    const token = generateVideoToken(session.user.id);
    const apiKey = getStreamApiKey();

    return NextResponse.json({
      apiKey,
      token,
      callId,
    });
  } catch (error) {
    console.error("POST /api/video/token failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
