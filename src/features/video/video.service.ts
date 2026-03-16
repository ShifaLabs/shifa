import { getStreamServerClient } from "./stream.client";

export function generateCallId(appointmentId: string) {
  return `consultation_${appointmentId}`;
}

type StreamUserLike = {
  id: string;
  name?: string;
  image?: string;
};

function uniqUsers(users: StreamUserLike[]) {
  const seen = new Set<string>();
  const result: StreamUserLike[] = [];

  for (const user of users) {
    if (!user?.id || seen.has(user.id)) continue;
    seen.add(user.id);
    result.push(user);
  }

  return result;
}

export async function ensureStreamUsers(users: StreamUserLike[]) {
  const streamClient = getStreamServerClient() as any;
  const normalizedUsers = uniqUsers(users).map((user) => ({
    id: user.id,
    name: user.name || "Shifa User",
    image: user.image,
  }));

  if (normalizedUsers.length === 0) return;

  if (typeof streamClient.upsertUsers === "function") {
    await streamClient.upsertUsers(normalizedUsers);
    return;
  }

  if (typeof streamClient.updateUsers === "function") {
    const mapped = normalizedUsers.reduce(
      (acc: Record<string, any>, user: any) => {
        acc[user.id] = user;
        return acc;
      },
      {},
    );
    await streamClient.updateUsers({ users: mapped });
    return;
  }

  throw new Error("Stream client does not support user upsert/update");
}

export async function createCall({
  callId,
  appointmentId,
  createdByUserId,
  doctorId,
  patientId,
  createdByName,
  doctorName,
  patientName,
}: {
  callId: string;
  appointmentId: string;
  createdByUserId: string;
  doctorId: string;
  patientId: string;
  createdByName?: string;
  doctorName?: string;
  patientName?: string;
}) {
  const streamClient = getStreamServerClient() as any;
  const call = streamClient.video.call("default", callId);

  await ensureStreamUsers([
    { id: createdByUserId, name: createdByName },
    { id: doctorId, name: doctorName },
    { id: patientId, name: patientName },
  ]);

  const memberIds = Array.from(
    new Set([doctorId, patientId, createdByUserId].filter(Boolean)),
  );

  const payload = {
    data: {
      created_by_id: createdByUserId,
      members: memberIds.map((userId) => ({ user_id: userId })),
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
