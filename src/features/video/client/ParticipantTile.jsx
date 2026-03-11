"use client";

import { memo } from "react";
import { Mic, MicOff, Video, VideoOff, Volume2 } from "lucide-react";

function ParticipantTile({ participant }) {
  const joinedTime = new Date(participant.joinedAt || 0).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="rounded-xl border border-white/15 bg-black/30 p-3 text-white/90">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold">{participant.name}</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80">
          {participant.role || "user"}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
        {participant.micOn ? (
          <Mic className="h-3.5 w-3.5" />
        ) : (
          <MicOff className="h-3.5 w-3.5 text-red-300" />
        )}
        {participant.cameraOn ? (
          <Video className="h-3.5 w-3.5" />
        ) : (
          <VideoOff className="h-3.5 w-3.5 text-red-300" />
        )}
        {participant.isSpeaking && (
          <Volume2 className="h-3.5 w-3.5 text-emerald-300" />
        )}
      </div>

      <p className="mt-2 text-[11px] text-white/60">Joined {joinedTime}</p>
    </div>
  );
}

export default memo(ParticipantTile);
