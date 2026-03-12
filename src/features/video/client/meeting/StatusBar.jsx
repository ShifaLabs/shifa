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
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-2xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb]/30 text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/95 sm:text-base">
              {meetingTitle}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span>{duration}</span>
              <span className="rounded-full border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-200">
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

          <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/85">
            <Users className="h-4 w-4" />
            {participantCount}
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default memo(StatusBar);
