type PublishPayload = {
  channel: string;
  event: string;
  data: Record<string, unknown>;
};

function getRealtimeMode() {
  if (process.env.AMBULANCE_REALTIME_MODE?.trim()) {
    return process.env.AMBULANCE_REALTIME_MODE.trim().toLowerCase();
  }

  return "noop";
}

export async function publishRealtimeEvent(payload: PublishPayload) {
  const mode = getRealtimeMode();

  if (mode === "noop") {
    // TODO: Wire a realtime adapter (Socket.IO/Pusher/Redis pub-sub). No events are delivered in noop mode.
    if (process.env.NODE_ENV !== "production") {
      console.info("[ambulance:realtime:noop]", payload.channel, payload.event);
    }
    return { delivered: false, mode };
  }

  console.warn(
    `[ambulance:realtime] Unsupported realtime mode "${mode}". Falling back to noop.`,
  );

  return { delivered: false, mode: "noop" };
}
