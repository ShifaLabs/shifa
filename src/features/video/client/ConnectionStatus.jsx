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
      ? "text-emerald-300"
      : connectionState === "reconnecting"
        ? "text-amber-300"
        : connectionState === "disconnected"
          ? "text-red-300"
          : "text-white/80";

  return <p className={`text-xs ${tone}`}>{text}</p>;
}
