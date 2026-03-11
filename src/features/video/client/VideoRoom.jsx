"use client";

import {
  StreamCall,
  StreamVideo,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { AlertCircle, RefreshCw, Shield, Users } from "lucide-react";
import { useVideoContext } from "./VideoProvider";
import VideoControls from "./VideoControls";
import ParticipantGrid from "./ParticipantGrid";
import CallStatusIndicator from "./CallStatusIndicator";
import ConnectionStatus from "./ConnectionStatus";
import LoadingScreen from "./LoadingScreen";
import ErrorScreen from "./ErrorScreen";

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

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="relative h-dvh w-full overflow-hidden bg-[#0A0A0B] text-white selection:bg-[#1F6F68]">
          {/* TOP HUD: Ultra-Modern Header */}
          <div className="absolute inset-x-0 top-0 z-50 px-4 pt-4 sm:px-8 sm:pt-6">
            <div className="mx-auto flex max-w-400 items-center justify-between rounded-[2rem] border border-white/5 bg-black/20 px-6 py-3 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-xl bg-[#1F6F68]/20 blur-md" />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-[#1F6F68] to-[#164e49] shadow-inner">
                    <Shield className="h-5 w-5 text-emerald-50" />
                  </div>
                </div>
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-white/90 sm:text-base">
                    Shifa <span className="text-[#1F6F68]">TeleHealth</span>
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">
                      Private Session • {appointmentId?.slice?.(-6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-4 sm:flex mr-4 border-r border-white/10 pr-4">
                  <ConnectionStatus />
                </div>
                <CallStatusIndicator />
              </div>
            </div>
          </div>

          {/* MAIN STAGE */}
          <div className="flex h-full w-full gap-4 p-4 pt-24 pb-28 sm:p-6 sm:pt-28 sm:pb-32 lg:px-8">
            {/* Left: Video Area */}
            <div className="relative flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#161618] shadow-2xl transition-all duration-500 hover:border-[#1F6F68]/30">
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40 pointer-events-none z-10" />
              <SpeakerLayout />
            </div>

            {/* Right: Participant Tray */}
            <aside className="hidden w-85 flex-col gap-4 lg:flex">
              <div className="flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#1F6F68]" />
                    <h3 className="text-sm font-bold tracking-tight text-white/80">
                      Consultants
                    </h3>
                  </div>
                  <span className="rounded-lg bg-[#1F6F68]/10 px-2 py-1 text-[10px] font-bold text-[#1F6F68] border border-[#1F6F68]/20">
                    {participants.length} ONLINE
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <ParticipantGrid />
                </div>

                {/* Status Card */}
                <div className="m-4 rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40 font-medium">
                        Doctor Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${isDoctorPresent ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}
                      >
                        {isDoctorPresent ? "READY" : "WAITING"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40 font-medium">
                        Patient Status
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${isPatientPresent ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}
                      >
                        {isPatientPresent ? "JOINED" : "OFFLINE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* BOTTOM CONTROLS DOCK */}
          <div className="absolute inset-x-0 bottom-8 z-50 flex justify-center px-4">
            <div className="group relative">
              {/* Glow effect behind controls */}
              <div className="absolute inset-0 -top-4 bg-[#1F6F68]/20 blur-3xl rounded-full opacity-50 transition-opacity group-hover:opacity-80" />
              <VideoControls />
            </div>
          </div>

          {/* Background Ambient Gradient */}
          <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-[#1F6F68]/5 blur-[120px]" />
          <div className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        </div>
      </StreamCall>
    </StreamVideo>
  );
}
