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
      <div className="group animate-in fade-in zoom-in-95 rounded-2xl border border-border/60 bg-linear-to-br from-card to-muted/30 p-3 text-foreground/90 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-muted/60">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-foreground tracking-tight">
              {participant.name}
            </p>
            <span className="inline-block mt-1 rounded-full border border-primary/35 bg-primary/15 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-primary">
              {participant.role || "user"}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {participant.micOn ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 transition-all group-hover:bg-primary/25">
                <Mic className="h-3.5 w-3.5 text-primary" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/20">
                <MicOff className="h-3.5 w-3.5 text-destructive" />
              </div>
            )}

            {participant.cameraOn ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 transition-all group-hover:bg-primary/25">
                <Video className="h-3.5 w-3.5 text-primary" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-destructive/20">
                <VideoOff className="h-3.5 w-3.5 text-destructive" />
              </div>
            )}

            {participant.isSpeaking && (
              <div className="flex h-6 w-6 animate-pulse items-center justify-center rounded-lg bg-accent/20">
                <Volume2 className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-[10px] font-medium text-muted-foreground">
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
            <p className="truncate text-sm font-bold tracking-tight text-foreground">
              {participant.name}
            </p>
            <span className="text-[10px] font-medium text-muted-foreground">
              {participant.role}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {!participant.micOn && (
          <div className="flex items-center gap-1.5 rounded-full border border-destructive/45 bg-destructive/20 px-2 py-1">
            <MicOff className="h-3 w-3 text-destructive" />
            <span className="text-[9px] font-semibold text-destructive">Muted</span>
          </div>
        )}

        {!participant.cameraOn && (
          <div className="flex items-center gap-1.5 rounded-full border border-destructive/45 bg-destructive/20 px-2 py-1">
            <VideoOff className="h-3 w-3 text-destructive" />
            <span className="text-[9px] font-semibold text-destructive">Off</span>
          </div>
        )}

        {participant.isSpeaking && (
          <div className="flex animate-pulse items-center gap-1.5 rounded-full border border-accent/45 bg-accent/25 px-2 py-1">
            <Volume2 className="h-3 w-3 text-accent-foreground" />
            <span className="text-[9px] font-semibold text-accent-foreground">
              Speaking
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ParticipantTile);
