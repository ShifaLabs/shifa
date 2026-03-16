"use client";

import { memo } from "react";
import {
  Camera,
  CameraOff,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Settings,
  Users,
} from "lucide-react";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

function Button({ icon: Icon, label, active, danger, disabled, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        danger
          ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-ring"
          : active
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring"
            : "border-border/60 bg-muted/60 text-foreground hover:bg-muted focus-visible:ring-ring",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function ControlBar({
  isMicMuted,
  isCameraMuted,
  isScreenSharing,
  isHandRaised,
  sidebar,
  onMic,
  onCamera,
  onScreenShare,
  onToggleChat,
  onToggleParticipants,
  onToggleSettings,
  onRaiseHand,
  onEnd,
  canScreenShare,
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-4 sm:pb-6">
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/85 px-5 py-2 shadow-2xl backdrop-blur-xl sm:gap-2.5 sm:px-4">
        <Button
          active={!isMicMuted}
          icon={isMicMuted ? MicOff : Mic}
          label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
          onClick={onMic}
        />

        <Button
          active={!isCameraMuted}
          icon={isCameraMuted ? CameraOff : Camera}
          label={isCameraMuted ? "Turn on camera" : "Turn off camera"}
          onClick={onCamera}
        />

        <Button
          active={isScreenSharing}
          icon={Monitor}
          label="Share screen"
          onClick={onScreenShare}
          disabled={!canScreenShare}
        />

        <Button
          active={sidebar === "chat"}
          icon={MessageSquare}
          label="Open chat"
          onClick={onToggleChat}
        />

        <Button
          active={sidebar === "participants"}
          icon={Users}
          label="Open participants"
          onClick={onToggleParticipants}
        />

        <Button
          active={isHandRaised}
          icon={Hand}
          label={isHandRaised ? "Lower hand" : "Raise hand"}
          onClick={onRaiseHand}
        />

        <Button
          active={sidebar === "settings"}
          icon={Settings}
          label="Open settings"
          onClick={onToggleSettings}
        />

        <Button danger icon={PhoneOff} label="End call" onClick={onEnd} />
      </div>
    </div>
  );
}

export default memo(ControlBar);
