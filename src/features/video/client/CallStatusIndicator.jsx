"use client";

import { useVideoContext } from "./VideoProvider";

const labels = {
  idle: "Idle",
  joining: "Joining call",
  "waiting-participant": "Waiting for participant",
  active: "Call in progress",
  reconnecting: "Reconnecting",
  ended: "Call ended",
};

export default function CallStatusIndicator() {
  const { callState, waitingLabel } = useVideoContext();

  const text = waitingLabel || labels[callState] || "Unknown state";

  const tone =
    callState === "active"
      ? "bg-emerald-500/20 text-emerald-200 border-emerald-300/30"
      : callState === "reconnecting"
        ? "bg-amber-500/20 text-amber-200 border-amber-300/30"
        : callState === "ended"
          ? "bg-red-500/20 text-red-200 border-red-300/30"
          : "bg-white/10 text-white/90 border-white/20";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tone}`}
    >
      {text}
    </span>
  );
}
