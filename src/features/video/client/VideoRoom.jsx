"use client";

import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingScreen from "./LoadingScreen.jsx";
import { useVideoContext } from "./VideoProvider";
import VideoMeetingLayout from "./meeting/VideoMeetingLayout";

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          Unable to join
        </h2>
        <p className="mb-6 text-sm text-destructive/90">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

function PostDisconnectScreen({ onReconnect, onGoDashboard }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Call ended</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          You have disconnected from the meeting.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onReconnect}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </button>
          <button
            type="button"
            onClick={onGoDashboard}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoRoom() {
  const router = useRouter();
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
      <div className="flex h-dvh w-full items-center justify-center bg-background text-muted-foreground">
        Unable to initialize call room.
      </div>
    );
  }

  if (callState === "ended") {
    return (
      <PostDisconnectScreen
        onReconnect={retryJoin}
        onGoDashboard={() => router.push("/dashboard")}
      />
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
