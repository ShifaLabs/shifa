"use client";

import { memo } from "react";
import { MicOff, UserMinus, Volume2, VolumeX } from "lucide-react";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

function ParticipantsPanel({
  entries,
  localUserId,
  activeSpeakerId,
  isHost,
  onMute,
}) {
  return (
    <div className="h-full min-h-0 space-y-2 overflow-auto pr-1">
      {entries.map((entry) => {
        const person = entry.participant;
        const isSpeaking = person.id === activeSpeakerId;
        const canControl = isHost && person.id !== localUserId;

        return (
          <div
            key={person.id}
            className={clsx(
              "flex items-center justify-between rounded-xl border p-3",
              isSpeaking
                ? "border-primary/45 bg-primary/10"
                : "border-border/60 bg-muted/40",
            )}
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground/90">
                {person.name} {person.id === localUserId ? "(You)" : ""}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{person.micOn ? "Mic on" : "Mic off"}</span>
                <span>{person.cameraOn ? "Camera on" : "Camera off"}</span>
                {isSpeaking && (
                  <span className="text-primary">Speaking</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {person.micOn ? (
                <Volume2 className="h-4 w-4 text-foreground/70" />
              ) : (
                <VolumeX className="h-4 w-4 text-destructive" />
              )}

              {canControl && (
                <>
                  <button
                    type="button"
                    onClick={() => onMute(entry.streamParticipant)}
                    title="Mute participant"
                    className="rounded-md border border-border/60 p-1 text-foreground/80 hover:bg-muted"
                  >
                    <MicOff className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove participant"
                    className="rounded-md border border-destructive/40 p-1 text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(ParticipantsPanel);
