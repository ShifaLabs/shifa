"use client";

import { useState, useMemo, memo } from "react";
import {
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Video,
  VideoOff,
  Settings,
  MoreVertical,
} from "lucide-react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useVideoContext } from "./VideoProvider";

function ControlButton({
  active,
  danger,
  onClick,
  icon: Icon,
  label,
  disabled,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const baseClasses =
    "relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 font-medium border-2 group";
  const stateClasses = danger
    ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95"
    : active
      ? "border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:border-primary"
      : "border-border/60 bg-muted/50 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground";

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`${baseClasses} ${stateClasses} ${disabledClasses}`}
        aria-label={label}
      >
        <Icon className="h-5 w-5" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/60 bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg animate-in fade-in zoom-in-75 duration-200">
          {label}
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-border/60 bg-card/95" />
        </div>
      )}
    </div>
  );
}

function VideoControls() {
  const call = useCall();
  const { leaveCall } = useVideoContext();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamMuted } = useCameraState();
  const [screenSharing, setScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const canToggleScreenShare = useMemo(
    () => typeof call?.screenShare?.toggle === "function",
    [call],
  );

  return (
    <>
      {/* Main control dock */}
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-2 rounded-full bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

        {/* Dock container */}
        <div className="relative flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 group-hover:border-primary/30 group-hover:bg-card">
          {/* Microphone */}
          <ControlButton
            active={!isMicMuted}
            onClick={() => microphone?.toggle?.()}
            icon={isMicMuted ? MicOff : Mic}
            label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
          />

          {/* Camera */}
          <ControlButton
            active={!isCamMuted}
            onClick={() => camera?.toggle?.()}
            icon={isCamMuted ? VideoOff : Video}
            label={isCamMuted ? "Turn on camera" : "Turn off camera"}
          />

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-border/70" />

          {/* Screen Share */}
          <ControlButton
            active={screenSharing}
            disabled={!canToggleScreenShare}
            onClick={async () => {
              if (!canToggleScreenShare) return;
              await call.screenShare.toggle();
              setScreenSharing((prev) => !prev);
            }}
            icon={Monitor}
            label="Share screen"
          />

          {/* Settings */}
          <ControlButton
            onClick={() => setShowSettings(!showSettings)}
            icon={Settings}
            label="Settings"
          />

          {/* Divider */}
          <div className="mx-1 h-6 w-px bg-border/70" />

          {/* Leave Call - Danger button */}
          <ControlButton
            danger
            onClick={leaveCall}
            icon={PhoneOff}
            label="Leave call"
          />
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute -top-32 left-1/2 z-50 w-64 -translate-x-1/2 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-3">
            <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Microphone
              </p>
              <p className="mt-1 text-sm text-foreground">
                {isMicMuted ? "🔴 Muted" : "🟢 Active"}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Camera
              </p>
              <p className="mt-1 text-sm text-foreground">
                {isCamMuted ? "🔴 Off" : "🟢 On"}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Screen Share
              </p>
              <p className="mt-1 text-sm text-foreground">
                {screenSharing ? "🟢 Sharing" : "⚪ Not Sharing"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(VideoControls);
