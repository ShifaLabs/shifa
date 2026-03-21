"use client";

import { useVideoContext } from "./VideoProvider";

const labels = {
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Connection lost - reconnecting",
  disconnected: "Disconnected",
};

export default function ConnectionStatus() {
  const { connectionState } = useVideoContext();

  const text = labels[connectionState] || connectionState || "Unknown";

  const tone =
    connectionState === "connected"
      ? "text-primary"
      : connectionState === "reconnecting"
        ? "text-accent-foreground"
        : connectionState === "disconnected"
          ? "text-destructive"
          : "text-muted-foreground";

  return <p className={`text-xs ${tone}`}>{text}</p>;
}
