"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VideoConsultationClient from "@/features/video/VideoConsultationClient";

function getStoredCredentials() {
  if (typeof window === "undefined") return null;

  const apiKey = sessionStorage.getItem("streamApiKey");
  const token = sessionStorage.getItem("streamToken");
  const callId = sessionStorage.getItem("streamCallId");
  const appointmentId = sessionStorage.getItem("appointmentId");

  if (!apiKey || !token || !callId) {
    return null;
  }

  return { apiKey, token, callId, appointmentId };
}

export default function VideoConsultationPage({ params }) {
  const [credentials] = useState(getStoredCredentials);
  const router = useRouter();

  useEffect(() => {
    if (!credentials) {
      console.error("Missing video credentials");
      router.push("/dashboard/patient/appointments");
    }
  }, [credentials, router]);

  if (!credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900">
      <VideoConsultationClient
        apiKey={credentials.apiKey}
        token={credentials.token}
        callId={credentials.callId}
      />
    </div>
  );
}
