import crypto from "crypto";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getStreamWebhookSecret } from "./stream.client";

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function validateStreamWebhookSignature(
  rawBody: string,
  signature: string | null,
) {
  if (!signature) return false;

  const secret = getStreamWebhookSecret();
  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return safeEqual(computed, signature);
}

function extractCallId(event: any) {
  if (typeof event?.call?.id === "string") return event.call.id;
  if (typeof event?.call_id === "string") return event.call_id;
  if (typeof event?.callId === "string") return event.callId;

  const cid = event?.call_cid || event?.callCid;
  if (typeof cid === "string" && cid.includes(":")) {
    return cid.split(":")[1];
  }

  return null;
}

function extractDate(value: unknown, fallback = new Date()) {
  if (!value) return fallback;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return fallback;
  return date;
}

function extractDurationSeconds(event: any) {
  const candidates = [
    event?.duration_seconds,
    event?.call?.session?.duration_seconds,
    event?.call_session?.duration_seconds,
    event?.session?.duration_seconds,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function extractRecordingUrl(event: any) {
  return (
    event?.recording?.url ||
    event?.call_recording?.url ||
    event?.recording_url ||
    event?.url ||
    null
  );
}

export async function handleStreamWebhookEvent(event: any) {
  const eventType = event?.type;
  const callId = extractCallId(event);

  if (!eventType || !callId) {
    return { ok: false, message: "Missing event type or call id" };
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  if (eventType === "call.session_started") {
    const startedAt = extractDate(
      event?.call_session?.started_at || event?.call?.session?.started_at,
    );

    const result = await appointmentsCollection.updateOne(
      {
        "videoSession.callId": callId,
        status: { $in: ["Confirmed", "confirmed"] },
      },
      {
        $set: {
          status: "in-progress",
          "videoSession.startedAt": startedAt,
          updatedAt: new Date(),
        },
      },
    );

    return { ok: true, modifiedCount: result.modifiedCount };
  }

  if (eventType === "call.session_ended") {
    const endedAt = extractDate(
      event?.call_session?.ended_at || event?.call?.session?.ended_at,
    );
    const durationSeconds = extractDurationSeconds(event);

    const result = await appointmentsCollection.updateOne(
      {
        "videoSession.callId": callId,
        status: "in-progress",
      },
      {
        $set: {
          status: "completed",
          "videoSession.endedAt": endedAt,
          ...(durationSeconds !== undefined
            ? { "videoSession.durationSeconds": durationSeconds }
            : {}),
          updatedAt: new Date(),
        },
      },
    );

    return { ok: true, modifiedCount: result.modifiedCount };
  }

  if (eventType === "call.recording_ready") {
    const recordingUrl = extractRecordingUrl(event);
    if (!recordingUrl) {
      return { ok: false, message: "Recording URL missing" };
    }

    const result = await appointmentsCollection.updateOne(
      {
        "videoSession.callId": callId,
      },
      {
        $set: {
          "videoSession.recordingUrl": recordingUrl,
          updatedAt: new Date(),
        },
      },
    );

    return { ok: true, modifiedCount: result.modifiedCount };
  }

  return { ok: true, ignored: true };
}
