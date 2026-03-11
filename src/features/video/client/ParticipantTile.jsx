"use client";

import { memo } from "react";
import { Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";

function ParticipantTile({ participant, variant = "sidebar" }) {
  // Card variant for sidebar
  if (variant === "sidebar") {
    if (!participant) return null;

    const joinedTime = new Date(participant.joinedAt || 0).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
    return (
      <div className="group rounded-2xl border border-white/10 bg-linear-to-br from-white/8 to-white/2 p-3 text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-[#1F6F68]/50 hover:bg-white/12 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-white tracking-tight">
              {participant.name}
            </p>
            <span className="inline-block mt-1 rounded-full bg-[#1F6F68]/25 px-2 py-0.5 text-[8px] uppercase tracking-widest font-semibold text-[#1F6F68] border border-[#1F6F68]/30">
              {participant.role || "user"}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {participant.micOn ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 transition-all group-hover:bg-emerald-500/30">
                <Mic className="h-3.5 w-3.5 text-emerald-300" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/20">
                <MicOff className="h-3.5 w-3.5 text-red-400" />
              </div>
            )}

            {participant.cameraOn ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 transition-all group-hover:bg-emerald-500/30">
                <Video className="h-3.5 w-3.5 text-emerald-300" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/20">
                <VideoOff className="h-3.5 w-3.5 text-red-400" />
              </div>
            )}

            {participant.isSpeaking && (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 animate-pulse">
                <Volume2 className="h-3.5 w-3.5 text-blue-400" />
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-[10px] text-white/40 font-medium">
          Joined {joinedTime}
        </p>
      </div>
    );
  }

  // Overlay variant (on video)
  if (!participant) return null;

  return (
    <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate tracking-tight">
              {participant.name}
            </p>
            <span className="text-[10px] text-white/60 font-medium">
              {participant.role}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {!participant.micOn && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/30 border border-red-500/50">
            <MicOff className="h-3 w-3 text-red-200" />
            <span className="text-[9px] font-semibold text-red-100">Muted</span>
          </div>
        )}

        {!participant.cameraOn && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/30 border border-red-500/50">
            <VideoOff className="h-3 w-3 text-red-200" />
            <span className="text-[9px] font-semibold text-red-100">Off</span>
          </div>
        )}

        {participant.isSpeaking && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/30 border border-blue-500/50 animate-pulse">
            <Volume2 className="h-3 w-3 text-blue-200" />
            <span className="text-[9px] font-semibold text-blue-100">
              Speaking
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ParticipantTile);
