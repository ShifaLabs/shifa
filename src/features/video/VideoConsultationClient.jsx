"use client";

import { VideoProvider, VideoRoom } from "./client";

export default function VideoConsultationClient({
  appointmentId,
  fallbackName = "Shifa User",
}) {
  return (
    <VideoProvider appointmentId={appointmentId} fallbackName={fallbackName}>
      <VideoRoom />
    </VideoProvider>
  );
}
