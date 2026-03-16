"use client";

import { memo } from "react";
import { Settings, Shield, Signal, Users } from "lucide-react";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

function StatusBar({
  meetingTitle,
  duration,
  recording,
  networkText,
  networkClass,
  participantCount,
  onOpenSettings,
}) {
  return (
    <header className="z-30 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-3 backdrop-blur-2xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {meetingTitle}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{duration}</span>
              <span className="rounded-full border border-destructive/40 bg-destructive/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-destructive">
                {recording ? "Recording" : "Not recording"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div
            className={clsx("hidden items-center gap-1 sm:flex", networkClass)}
          >
            <Signal className="h-4 w-4" />
            <span>{networkText}</span>
          </div>

          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-foreground/90">
            <Users className="h-4 w-4" />
            {participantCount}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(StatusBar);
