"use client";

import { memo, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Maximize2,
  Mic,
  MicOff,
  Pin,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  VolumeX,
} from "lucide-react";
import { ParticipantView } from "@stream-io/video-react-sdk";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

function qualityMeta(rawQuality) {
  const quality = String(rawQuality || "").toLowerCase();
  if (
    quality.includes("excellent") ||
    quality.includes("high") ||
    quality === "good"
  ) {
    return {
      Icon: SignalHigh,
      className: "text-emerald-300",
      label: "Excellent connection",
    };
  }
  if (quality.includes("medium") || quality.includes("fair")) {
    return {
      Icon: SignalMedium,
      className: "text-amber-300",
      label: "Fair connection",
    };
  }
  if (quality.includes("low") || quality.includes("poor")) {
    return {
      Icon: SignalLow,
      className: "text-red-300",
      label: "Poor connection",
    };
  }
  return {
    Icon: Signal,
    className: "text-white/70",
    label: "Connection quality unavailable",
  };
}

function VideoTile({
  streamParticipant,
  participant,
  isLocal,
  isPinned,
  isActiveSpeaker,
  showActions,
  canHostControl,
  onMute,
  onPin,
  onExpand,
  // These carry the participantId so onPin/onExpand don't need
  // inline arrows in the parent (which would break memo comparisons).
  pinParticipantId,
  expandParticipantId,
}) {
  const safeParticipant = participant ?? {};

  const quality = qualityMeta(
    safeParticipant.connectionQuality || streamParticipant?.connectionQuality,
  );

  const initials = (safeParticipant.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Build stable callbacks inside the memo component so they aren't recreated
  // per-render in the parent. Using useCallback here is fine because the deps
  // are primitive IDs that only change when the tile itself changes.
  const handlePin = useCallback(
    () => onPin?.(pinParticipantId),
    [onPin, pinParticipantId],
  );
  const handleExpand = useCallback(
    () => onExpand?.(expandParticipantId),
    [onExpand, expandParticipantId],
  );
  const handleMute = useCallback(() => {
    if (streamParticipant) onMute?.(streamParticipant);
  }, [onMute, streamParticipant]);

  const isMicOff = safeParticipant.micOn === false;
  const isCameraOff = safeParticipant.cameraOn === false;
  const showLoading = false;
  const participantName = safeParticipant.name || "Participant";

  return (
    <article
      className={clsx(
        "group relative overflow-hidden rounded-2xl border bg-[#1e293b] shadow-[0_14px_34px_rgba(2,6,23,0.5)] transition-all duration-300",
        "border-white/10",
        isPinned && "border-[#2563eb]/90 ring-2 ring-[#2563eb]/70",
        isActiveSpeaker && "border-emerald-300/90 ring-2 ring-emerald-400/70",
      )}
      style={{ aspectRatio: "16 / 9" }}
    >
      <div className="absolute inset-0 bg-black/45">
        {streamParticipant ? (
          <ParticipantView participant={streamParticipant} />
        ) : null}
      </div>

      {isCameraOff && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f172a]/85">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
              {initials}
            </div>
            <p className="text-xs text-white/80">Camera off</p>
          </div>
        </div>
      )}

      {showLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#0f172a]/50 backdrop-blur-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563eb]/35 border-t-[#2563eb]" />
        </div>
      )}

      {isActiveSpeaker && (
        <div className="pointer-events-none absolute inset-0 z-20 animate-pulse rounded-2xl border-2 border-emerald-300/70 shadow-[0_0_32px_rgba(16,185,129,0.45)]" />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between p-2.5">
        <div className="rounded-lg border border-white/10 bg-black/45 px-2 py-1 text-xs text-white/90 backdrop-blur-md">
          {participantName} {isLocal ? "(You)" : ""}
        </div>

        <div
          aria-label={quality.label}
          title={quality.label}
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-black/45 backdrop-blur-md",
            quality.className,
          )}
        >
          <quality.Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md">
          {isMicOff ? (
            <MicOff className="h-4 w-4 text-red-300" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md">
          {isCameraOff ? (
            <CameraOff className="h-4 w-4 text-red-300" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </div>
      </div>

      {showActions && (
        <div className="absolute right-2.5 top-11 z-40 hidden flex-col gap-1.5 opacity-0 transition md:flex md:group-hover:opacity-100">
          {canHostControl && (
            <button
              type="button"
              onClick={handleMute}
              title="Mute participant"
              aria-label="Mute participant"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white hover:bg-black/80"
            >
              <VolumeX className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handlePin}
            title={isPinned ? "Unpin video" : "Pin video"}
            aria-label={isPinned ? "Unpin video" : "Pin video"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white hover:bg-black/80"
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExpand}
            title="Expand video"
            aria-label="Expand video"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white hover:bg-black/80"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </article>
  );
}

export default memo(VideoTile, (prev, next) => {
  return (
    prev.streamParticipant?.sessionId === next.streamParticipant?.sessionId &&
    prev.participant?.id === next.participant?.id &&
    prev.participant?.name === next.participant?.name &&
    prev.participant?.micOn === next.participant?.micOn &&
    prev.participant?.cameraOn === next.participant?.cameraOn &&
    prev.participant?.connectionQuality ===
      next.participant?.connectionQuality &&
    prev.participant?.joinedAt === next.participant?.joinedAt &&
    prev.isLocal === next.isLocal &&
    prev.isPinned === next.isPinned &&
    prev.isActiveSpeaker === next.isActiveSpeaker &&
    prev.showActions === next.showActions &&
    prev.canHostControl === next.canHostControl &&
    prev.pinParticipantId === next.pinParticipantId &&
    prev.expandParticipantId === next.expandParticipantId &&
    prev.onMute === next.onMute &&
    prev.onPin === next.onPin &&
    prev.onExpand === next.onExpand
  );
});
