"use client";

import { useMemo, useState } from "react";
import { Mic, MicOff, Monitor, PhoneOff, Video, VideoOff } from "lucide-react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useVideoContext } from "./VideoProvider";

function ControlButton({ active, danger, onClick, icon, label, disabled }) {
  const tone = danger
    ? "bg-red-500 hover:bg-red-600 text-white"
    : active
      ? "bg-white/20 text-white"
      : "bg-red-500/20 text-red-200 border border-red-300/40";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition ${tone} disabled:cursor-not-allowed disabled:opacity-50`}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export default function VideoControls() {
  const call = useCall();
  const { leaveCall } = useVideoContext();
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamMuted } = useCameraState();
  const [screenSharing, setScreenSharing] = useState(false);

  const canToggleScreenShare = useMemo(
    () => typeof call?.screenShare?.toggle === "function",
    [call],
  );

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <ControlButton
        active={!isMicMuted}
        onClick={() => microphone?.toggle?.()}
        icon={
          isMicMuted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )
        }
        label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
      />

      <ControlButton
        active={!isCamMuted}
        onClick={() => camera?.toggle?.()}
        icon={
          isCamMuted ? (
            <VideoOff className="h-5 w-5" />
          ) : (
            <Video className="h-5 w-5" />
          )
        }
        label={isCamMuted ? "Turn on camera" : "Turn off camera"}
      />

      <ControlButton
        active={screenSharing}
        disabled={!canToggleScreenShare}
        onClick={async () => {
          if (!canToggleScreenShare) return;
          await call.screenShare.toggle();
          setScreenSharing((prev) => !prev);
        }}
        icon={<Monitor className="h-5 w-5" />}
        label="Toggle screen sharing"
      />

      <ControlButton
        danger
        active
        onClick={leaveCall}
        icon={<PhoneOff className="h-5 w-5" />}
        label="Leave call"
      />
    </div>
  );
}
