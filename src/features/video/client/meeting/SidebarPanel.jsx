"use client";

import { memo } from "react";
import { X } from "lucide-react";
import ChatPanel from "./ChatPanel";
import ParticipantsPanel from "./ParticipantsPanel";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

function SidebarPanel({
  panel,
  isMobile,
  entries,
  localUserId,
  activeSpeakerId,
  isHost,
  chatMessages,
  chatInput,
  onChatInput,
  onChatSend,
  onMute,
  onClose,
}) {
  if (!panel) return null;

  return (
    <aside
      className={clsx(
        "z-40 min-h-0 overflow-hidden border-l border-white/10 bg-[#0b1220]/95 p-4 backdrop-blur-2xl",
        "transition-all duration-300",
        isMobile ? "fixed inset-0 pt-20" : "h-full pt-4",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85">
          {panel === "chat"
            ? "Chat"
            : panel === "participants"
              ? "Participants"
              : "Settings"}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/5 p-1.5 text-white/80 hover:bg-white/15"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[calc(100%-2.75rem)] min-h-0">
        {panel === "chat" && (
          <ChatPanel
            messages={chatMessages}
            inputValue={chatInput}
            onInputChange={onChatInput}
            onSend={onChatSend}
          />
        )}

        {panel === "participants" && (
          <ParticipantsPanel
            entries={entries}
            localUserId={localUserId}
            activeSpeakerId={activeSpeakerId}
            isHost={isHost}
            onMute={onMute}
          />
        )}

        {panel === "settings" && (
          <div className="space-y-3 text-sm text-white/80">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-white/60">
                Keyboard shortcuts
              </p>
              <ul className="space-y-1 text-xs text-white/75">
                <li>M: Toggle microphone</li>
                <li>C: Toggle camera</li>
                <li>S: Toggle screen share</li>
                <li>P: Open participants</li>
                <li>G: Open chat</li>
                <li>H: Raise/lower hand</li>
                <li>Esc: Close side panel</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default memo(SidebarPanel);
