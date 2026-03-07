import { getStreamServerClient } from "./stream.client";

export function generateCallId(appointmentId: string) {
  return `consultation_${appointmentId}`;
}

export async function createCall({
  callId,
  appointmentId,
  createdByUserId,
  doctorId,
  patientId,
}: {
  callId: string;
  appointmentId: string;
  createdByUserId: string;
  doctorId: string;
  patientId: string;
}) {
  const streamClient = getStreamServerClient() as any;
  const call = streamClient.video.call("default", callId);

  const payload = {
    data: {
      created_by_id: createdByUserId,
      members: [{ user_id: doctorId }, { user_id: patientId }],
      custom: { appointmentId },
    },
  };

  if (typeof call.getOrCreate === "function") {
    await call.getOrCreate(payload);
    return;
  }

  if (typeof call.create === "function") {
    await call.create(payload);
    return;
  }

  throw new Error("Stream call creation method not available");
}

export async function getCall(callId: string) {
  const streamClient = getStreamServerClient() as any;
  const call = streamClient.video.call("default", callId);

  if (typeof call.get === "function") {
    await call.get();
  }

  return call;
}

