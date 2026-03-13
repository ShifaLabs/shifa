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
      ? "bg-primary/15 text-primary border-primary/35"
      : callState === "reconnecting"
        ? "bg-accent/20 text-accent-foreground border-accent/35"
        : callState === "ended"
          ? "bg-destructive/15 text-destructive border-destructive/35"
          : "bg-muted/70 text-foreground border-border/70";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tone}`}
    >
      {text}
    </span>
  );
}
