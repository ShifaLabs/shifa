"use client";

import { useEffect, useState } from "react";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";

export default function VideoConsultationClient({
  appointmentId,
  fallbackName = "Shifa User",
}) {
  const [tokenPayload, setTokenPayload] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let streamClient = null;
    let streamCall = null;

    const init = async () => {
      try {
        setLoading(true);
        setError("");

        const tokenRes = await fetch("/api/video/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentId }),
        });
        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          throw new Error(tokenData?.error || "Unable to join consultation");
        }

        if (!isMounted) return;
        setTokenPayload(tokenData);

        streamClient = new StreamVideoClient({
          apiKey: tokenData.apiKey,
          user: {
            id: tokenData.userId,
            name: tokenData.userName || fallbackName,
          },
          token: tokenData.token,
        });

        streamCall = streamClient.call("default", tokenData.callId);
        await streamCall.join({ create: true });

        if (!isMounted) return;
        setClient(streamClient);
        setCall(streamCall);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;

      if (streamCall) {
        streamCall.leave().catch(() => {});
      }

      if (streamClient) {
        streamClient.disconnectUser().catch(() => {});
      }
    };
  }, [appointmentId, fallbackName]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-600">
          Connecting your consultation...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!client || !call || !tokenPayload) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-slate-600">
          Unable to initialize consultation.
        </p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="min-h-[80vh] rounded-xl overflow-hidden border border-slate-200 bg-white">
          <SpeakerLayout />
          <CallControls />
        </div>
      </StreamCall>
    </StreamVideo>
  );
}
