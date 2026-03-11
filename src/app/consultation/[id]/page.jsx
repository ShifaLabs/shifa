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
  const appointmentId = params?.id;
  const [credentials, setCredentials] = useState(getStoredCredentials);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (credentials?.callId) {
        setLoading(false);
        return;
      }

      if (!appointmentId) {
        setLoading(false);
        router.push("/dashboard/patient/appointments");
        return;
      }

      try {
        const response = await fetch("/api/video/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId }),
        });

        if (!response.ok) {
          throw new Error("Unable to initialize consultation credentials");
        }

        const payload = await response.json();
        const nextCredentials = {
          apiKey: payload.apiKey,
          token: payload.token,
          callId: payload.callId,
          appointmentId,
        };

        sessionStorage.setItem("streamApiKey", nextCredentials.apiKey);
        sessionStorage.setItem("streamToken", nextCredentials.token);
        sessionStorage.setItem("streamCallId", nextCredentials.callId);
        sessionStorage.setItem("appointmentId", appointmentId);

        if (isMounted) {
          setCredentials(nextCredentials);
        }
      } catch (error) {
        console.error("Missing video credentials", error);
        router.push("/dashboard/patient/appointments");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [appointmentId, credentials, router]);

  if (loading || !credentials) {
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
