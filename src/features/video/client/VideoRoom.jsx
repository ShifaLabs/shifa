"use client";

import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { AlertCircle, RefreshCw } from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import { useVideoContext } from "./VideoProvider";
import VideoMeetingLayout from "./meeting/VideoMeetingLayout";

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#0a0a0b] px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-400/25 bg-red-500/10 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
          <AlertCircle className="h-7 w-7 text-red-300" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Unable to join
        </h2>
        <p className="mb-6 text-sm text-red-100/85">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

export default function VideoRoom() {
  const {
    client,
    call,
    loading,
    error,
    retryJoin,
    appointmentId,
    currentUser,
    callState,
    connectionState,
    isDoctorPresent,
    isPatientPresent,
    leaveCall,
  } = useVideoContext();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retryJoin} />;

  if (!client || !call) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-[#0a0a0b] text-white/70">
        Unable to initialize call room.
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoMeetingLayout
          appointmentId={appointmentId}
          currentUser={currentUser}
          callState={callState}
          connectionState={connectionState}
          isDoctorPresent={isDoctorPresent}
          isPatientPresent={isPatientPresent}
          leaveCall={leaveCall}
        />
      </StreamCall>
    </StreamVideo>
  );
}
