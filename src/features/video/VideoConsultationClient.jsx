"use client";

import { VideoProvider } from "./client/VideoProvider";
import VideoRoom from "./client/VideoRoom";

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
