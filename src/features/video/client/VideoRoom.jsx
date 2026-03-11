"use client";

import { StreamVideo, StreamCall } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { AlertCircle, RefreshCw, Shield } from "lucide-react";
import { useVideoContext } from "./VideoProvider";
import VideoControls from "./VideoControls";
import ParticipantGrid from "./ParticipantGrid";
import CallStatusIndicator from "./CallStatusIndicator";
import ConnectionStatus from "./ConnectionStatus";
import JoinNotification from "./JoinNotification";
import LoadingScreen from "./LoadingScreen";
import { ParticipantView, useCallStateHooks } from "@stream-io/video-react-sdk";

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="h-dvh w-full bg-[#0A0A0B] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-400/20 bg-red-500/8 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Unable to join
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-red-200/80">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1F6F68] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1a5e58] active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}

// Google Meet-style responsive video grid
// Dynamically adjusts grid layout based on participant count
// 1 participant: 1×1 fullscreen
// 2 participants: 2×1 split screen
// 3-4 participants: 2×2 square grid (equal sizes)
// 5-6 participants: 3×2 layout
// 7-9 participants: 3×3 layout
// 10-12 participants: 4×3 layout
// 13-16 participants: 4×4 layout
// 17+ participants: 4×N scrollable layout
function ResponsiveVideoGrid({ participants, client, call }) {
  const { useParticipants } = useCallStateHooks();
  const allParticipants = useParticipants();
  const count = allParticipants?.length || 0;

  /**
   * Calculate grid dimensions based on participant count
   * Follows Google Meet pattern for optimal video conference layouts
   */
  const getGridConfiguration = (participantCount) => {
    // Determine optimal grid dimensions
    if (participantCount === 0) return { cols: 1, rows: 1 };
    if (participantCount === 1) return { cols: 1, rows: 1 };
    if (participantCount === 2) return { cols: 1, rows: 2 };
    if (participantCount <= 4) return { cols: 2, rows: 2 };
    if (participantCount <= 6) return { cols: 3, rows: 2 };
    if (participantCount <= 9) return { cols: 3, rows: 3 };
    if (participantCount <= 12) return { cols: 4, rows: 3 };
    if (participantCount <= 16) return { cols: 4, rows: 4 };
    // For more than 16 participants, use 4 columns with scrollable rows
    return { cols: 4, rows: Math.ceil(participantCount / 4) };
  };

  // Get responsive grid columns for mobile/tablet/desktop
  const getResponsiveGridCols = (participantCount) => {
    // Mobile: max 2 columns
    // Tablet: 2-3 columns
    // Desktop: full calculation
    if (participantCount <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (participantCount <= 4)
      return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2";
    if (participantCount <= 6)
      return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3";
    if (participantCount <= 9)
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  };

  const gridConfig = getGridConfiguration(count);
  const responsiveColsClass = getResponsiveGridCols(count);

  return (
    <div className="relative w-full h-full pt-24 pb-28 px-3 sm:px-4 lg:px-6">
      {/* Video grid container - Google Meet style with automatic flow */}
      <div
        className={`grid gap-2 sm:gap-3 lg:gap-4 h-full w-full max-h-[calc(100dvh-150px)] overflow-y-auto ${responsiveColsClass}`}
        style={{
          gridAutoRows: "minmax(0, 1fr)",
        }}
      >
        {allParticipants.map((participant, idx) => {
          const participantData = participants.find(
            (p) => p.id === participant.userId,
          );
          const isActiveSpeaker = participantData?.isSpeaking;

          return (
            <div
              key={participant.sessionId}
              className={`
                relative overflow-hidden 
                rounded-lg sm:rounded-xl lg:rounded-2xl
                bg-black/40 border border-white/10
                transition-all duration-300 ease-out
                hover:border-white/20 hover:shadow-lg hover:shadow-[#1F6F68]/20
                group
                ${isActiveSpeaker ? "ring-2 sm:ring-3 ring-[#1F6F68] scale-[1.01] sm:scale-[1.02]" : ""}
              `}
              style={{
                aspectRatio: "16/9",
                animationDelay: `${idx * 50}ms`,
              }}
            >
              {/* Video display container */}
              <div className="relative w-full h-full overflow-hidden">
                {/* Stream video element */}
                <div className="absolute inset-0">
                  <ParticipantView participant={participant} />
                </div>

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                {/* Participant information badge - bottom left */}
                {participantData && (
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 lg:p-4 pointer-events-none z-10">
                    <div className="flex items-end justify-between gap-2 sm:gap-3">
                      {/* Name and role */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                          {participantData.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-white/50 font-medium truncate">
                          {participantData.role}
                        </p>
                      </div>

                      {/* Status indicators - right side */}
                      <div className="flex gap-1 sm:gap-1.5 shrink-0">
                        {!participantData.micOn && (
                          <div
                            className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-red-500/30 border border-red-500/50 backdrop-blur-sm"
                            title="Microphone muted"
                          >
                            <span className="text-[10px] sm:text-xs leading-none">
                              🔇
                            </span>
                          </div>
                        )}

                        {!participantData.cameraOn && (
                          <div
                            className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-red-500/30 border border-red-500/50 backdrop-blur-sm"
                            title="Camera off"
                          >
                            <span className="text-[10px] sm:text-xs leading-none">
                              📷
                            </span>
                          </div>
                        )}

                        {isActiveSpeaker && (
                          <div
                            className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-emerald-500/40 border border-emerald-400/60 backdrop-blur-sm animate-pulse"
                            title="Speaking"
                          >
                            <span className="text-[10px] sm:text-xs leading-none animate-bounce">
                              🎤
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active speaker glowing border effect */}
                {isActiveSpeaker && (
                  <div className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 border-[#1F6F68]/60 pointer-events-none animate-pulse" />
                )}

                {/* Hover enhancement border */}
                <div className="absolute inset-0 rounded-lg sm:rounded-xl lg:rounded-2xl border border-white/0 group-hover:border-white/30 transition-all duration-300 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state - no participants connected yet */}
      {count === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-in fade-in duration-500">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
              <Shield className="h-8 w-8 text-white/40" />
            </div>
            <p className="text-sm font-medium text-white/60">
              Waiting for participants to join...
            </p>
          </div>
        </div>
      )}
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
    participants,
    isDoctorPresent,
    isPatientPresent,
  } = useVideoContext();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={retryJoin} />;

  if (!client || !call) {
    return (
      <div className="h-dvh w-full bg-[#0A0A0B] flex items-center justify-center text-white/70">
        Unable to initialize call room.
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="relative h-dvh w-full overflow-hidden bg-linear-to-br from-[#0A0A0B] via-[#0F1419] to-[#0A0A0B] text-white selection:bg-[#1F6F68]">
          {/* Join notifications */}
          <JoinNotification />

          {/* TOP HUD: Ultra-Modern Header */}
          <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-4">
            <div className="flex items-center justify-between rounded-2xl sm:rounded-3xl border border-white/5 bg-black/30 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-2xl shadow-2xl">
              {/* Left: Branding */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-[#1F6F68]/20 blur-md" />
                  <div className="relative flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#1F6F68] to-[#164e49] shadow-inner">
                    <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-emerald-50" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-white/90 truncate">
                    Shifa <span className="text-[#1F6F68]">Virtual</span>
                  </h1>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 truncate">
                      ID: {appointmentId?.slice?.(-6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Status indicators */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="hidden sm:flex items-center gap-3 pr-3 sm:pr-4 border-r border-white/10">
                  <ConnectionStatus />
                </div>
                <CallStatusIndicator />
              </div>
            </div>
          </div>

          {/* VIDEO GRID - Main content (full height minus header and controls) */}
          <div className="absolute top-0 left-0 right-0 bottom-0 z-10 overflow-hidden">
            <ResponsiveVideoGrid
              participants={participants}
              client={client}
              call={call}
            />
          </div>

          {/* BOTTOM RIGHT: Participant sidebar (desktop only) */}
          <div className="fixed bottom-32 right-4 z-40 hidden lg:flex flex-col gap-2 max-w-xs max-h-96 overflow-y-auto">
            {participants.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-white/10 bg-black/50 p-3 backdrop-blur-sm transition-all duration-300 hover:border-[#1F6F68]/50 hover:bg-black/70 animate-in fade-in zoom-in-95"
              >
                <p className="text-xs font-bold text-white truncate">
                  {p.name}
                </p>
                <div className="mt-1.5 flex gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/70 font-medium">
                    {p.role}
                  </span>
                  {p.isSpeaking && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/40 text-blue-200 font-semibold animate-pulse">
                      🎤
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM CONTROLS DOCK - Floating control bar (always visible) */}
          <div className="fixed w-full inset-x-0 bottom-0 z-50 flex justify-center pb-6 px-4 sm:px-6">
            <VideoControls />
          </div>

          {/* Background ambient gradients */}
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#1F6F68]/5 blur-3xl pointer-events-none" />
          <div className="absolute -right-40 -bottom-40 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        </div>
      </StreamCall>
    </StreamVideo>
  );
}
