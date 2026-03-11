"use client";

import { use } from "react";
import VideoConsultationClient from "@/features/video/VideoConsultationClient";

export default function VideoConsultationPage({ params }) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams?.id;

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <p>Invalid consultation link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900">
      <VideoConsultationClient appointmentId={appointmentId} />
    </div>
  );
}
