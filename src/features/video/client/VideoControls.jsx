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
    ? "border-red-500 bg-red-500 text-white hover:bg-red-600 active:scale-95"
    : active
      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-500"
      : "border-white/20 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white";

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
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg bg-black/90 text-white text-xs font-medium whitespace-nowrap border border-white/10 shadow-lg animate-in fade-in zoom-in-75 duration-200">
          {label}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 bg-black/90 rotate-45 border-r border-b border-white/10" />
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
        <div className="absolute -inset-2 bg-linear-to-r from-[#1F6F68]/0 via-[#1F6F68]/10 to-[#1F6F68]/0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Dock container */}
        <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 group-hover:border-[#1F6F68]/30 group-hover:bg-black/60">
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
          <div className="h-6 w-px bg-white/10 mx-1" />

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
          <div className="h-6 w-px bg-white/10 mx-1" />

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
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 z-50 w-64 rounded-2xl border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Microphone
              </p>
              <p className="text-sm text-white mt-1">
                {isMicMuted ? "🔴 Muted" : "🟢 Active"}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Camera
              </p>
              <p className="text-sm text-white mt-1">
                {isCamMuted ? "🔴 Off" : "🟢 On"}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Screen Share
              </p>
              <p className="text-sm text-white mt-1">
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
