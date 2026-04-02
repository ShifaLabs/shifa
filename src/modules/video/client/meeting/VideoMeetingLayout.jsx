"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import JoinNotification from "../JoinNotification";
import VideoGrid from "./VideoGrid";
import SidebarPanel from "./SidebarPanel";
import ControlBar from "./ControlBar";
import StatusBar from "./StatusBar";

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;

  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/**
 * Debounced viewport-width hook.
 * Initialises synchronously on the client so the first render is accurate.
 * Debounces resize events (150 ms) and bails out when width is unchanged
 * to prevent cascading layout → ResizeObserver → setState loops.
 */
function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const timerRef = useRef(null);

  useEffect(() => {
    const sync = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setWidth((prev) => {
          const next = window.innerWidth;
          return next !== prev ? next : prev; // bail out when unchanged
        });
      }, 150);
    };
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("resize", sync);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return width;
}

function VideoMeetingLayout({
  appointmentId,
  // participants is intentionally omitted – entries now derive solely from
  // streamParticipants (Stream SDK) to avoid rapid participant.updated cascades.
  currentUser,
  callState,
  connectionState,
  isDoctorPresent,
  isPatientPresent,
  leaveCall,
}) {
  const call = useCall();
  const { useParticipants, useMicrophoneState, useCameraState } =
    useCallStateHooks();

  const streamParticipantsRaw = useParticipants();
  const streamParticipants = useMemo(
    () => (Array.isArray(streamParticipantsRaw) ? streamParticipantsRaw : []),
    [streamParticipantsRaw],
  );
  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCameraMuted } = useCameraState();

  const [sidebar, setSidebar] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [startedAt] = useState(() => Date.now());
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [actionError, setActionError] = useState("");
  const [connectionToast, setConnectionToast] = useState("");
  const callRef = useRef(call);
  const microphoneRef = useRef(microphone);
  const cameraRef = useRef(camera);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  useEffect(() => {
    microphoneRef.current = microphone;
  }, [microphone]);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const viewportWidth = useViewportWidth();
  // Guard: width===0 means SSR or pre-hydration – treat as desktop to avoid flicker
  const isMobile = viewportWidth > 0 && viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const sidebarWidth = isTablet ? 280 : 320;
  const isSidebarOpen = sidebar !== null;
  const isHost = currentUser?.role === "doctor";

  // Destructure primitive values so the entries memo only invalidates when
  // actual values change, not when the currentUser object reference changes.
  const currentUserId = currentUser?.id ?? null;
  const currentUserName = currentUser?.name ?? null;
  const currentUserRole = currentUser?.role ?? null;

  // Derive entries purely from the Stream SDK to avoid cascading updates from
  // VideoProvider.participants (rapid participant.updated events would recreate
  // participantMap → entries → speaker effect → setState infinite loop).
  const entries = useMemo(
    () =>
      streamParticipants.map((sp) => ({
        streamParticipant: sp,
        participant: {
          id: sp.userId,
          name:
            sp.userId === currentUserId
              ? (currentUserName ?? sp.name ?? sp.user?.name ?? "Participant")
              : (sp.name ?? sp.user?.name ?? "Participant"),
          role:
            sp.userId === currentUserId
              ? (currentUserRole ?? sp.user?.role ?? "participant")
              : (sp.user?.role ?? "participant"),
          micOn: typeof sp.audioEnabled === "boolean" ? sp.audioEnabled : true,
          cameraOn:
            typeof sp.videoEnabled === "boolean" ? sp.videoEnabled : true,
          isSpeaking: Boolean(sp.isSpeaking),
          // Normalise joinedAt: Stream SDK may return a Date object or ms number
          joinedAt:
            sp.joinedAt instanceof Date
              ? sp.joinedAt.getTime()
              : (sp.joinedAt ?? 0),
          connectionQuality: sp.connectionQuality ?? null,
        },
      })),
    [streamParticipants, currentUserId, currentUserName, currentUserRole],
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeSpeakerId = useMemo(
    () => streamParticipants.find((sp) => sp.isSpeaking)?.userId ?? null,
    [streamParticipants],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[video-ui] participants", streamParticipants.length);
    }
  }, [streamParticipants.length]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[video-ui] connection", connectionState);
    }
  }, [connectionState]);

  useEffect(() => {
    if (connectionState === "reconnecting") {
      setConnectionToast("Connection lost. Reconnecting...");
      return;
    }
    if (connectionState === "disconnected") {
      setConnectionToast("Disconnected from meeting.");
      return;
    }
    if (connectionState === "connected") {
      setConnectionToast("Connected.");
      const timer = setTimeout(() => setConnectionToast(""), 1500);
      return () => clearTimeout(timer);
    }
  }, [connectionState]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      const key = event.key.toLowerCase();
      if (key === "m") microphoneRef.current?.toggle?.();
      if (key === "c") cameraRef.current?.toggle?.();
      if (key === "s") {
        if (typeof callRef.current?.screenShare?.toggle === "function") {
          callRef.current.screenShare.toggle();
          setScreenSharing((prev) => !prev);
        }
      }
      if (key === "p") {
        setSidebar((prev) => (prev === "participants" ? null : "participants"));
      }
      if (key === "g") {
        setSidebar((prev) => (prev === "chat" ? null : "chat"));
      }
      if (key === "h") setHandRaised((prev) => !prev);
      if (key === "escape") {
        setSidebar(null);
        setExpandedId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sortedEntries = useMemo(() => {
    const list = [...entries].sort((a, b) => {
      if (a.participant.id === activeSpeakerId) return -1;
      if (b.participant.id === activeSpeakerId) return 1;
      return a.participant.name.localeCompare(b.participant.name);
    });
    return list;
  }, [activeSpeakerId, entries]);

  const sendChat = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender: currentUser?.name ?? "You",
        text,
        mine: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setChatInput("");
  }, [chatInput, currentUser?.name]);

  const onMuteParticipant = useCallback(
    async (streamParticipant) => {
      setActionError("");
      if (!isHost || !streamParticipant?.userId) return;
      try {
        const activeCall = callRef.current;
        if (typeof activeCall?.muteUser === "function") {
          await activeCall.muteUser(streamParticipant.userId);
          return;
        }
        if (typeof activeCall?.muteUsers === "function") {
          await activeCall.muteUsers([streamParticipant.userId]);
          return;
        }
        setActionError("Host mute is unavailable for this provider.");
      } catch {
        setActionError("Unable to mute participant right now.");
      }
    },
    [isHost],
  );

  // ── Stable handlers for VideoGrid props ───────────────────────────────────
  // These MUST be useCallback so VideoGrid's React.memo comparison passes.
  // Inline arrow functions here recreate on every render and bust the memo.
  const onPin = useCallback((participantId) => {
    setPinnedId((prev) => (prev === participantId ? null : participantId));
  }, []);

  const onExpand = useCallback((participantId) => {
    setExpandedId(participantId ?? null);
  }, []);

  const onCloseExpanded = useCallback(() => setExpandedId(null), []);
  const closeSidebar = useCallback(() => setSidebar(null), []);

  const onMic = useCallback(() => microphoneRef.current?.toggle?.(), []);
  const onCamera = useCallback(() => cameraRef.current?.toggle?.(), []);
  const onRaiseHand = useCallback(() => setHandRaised((prev) => !prev), []);

  const onScreenShare = useCallback(async () => {
    const activeCall = callRef.current;
    if (typeof activeCall?.screenShare?.toggle !== "function") return;
    await activeCall.screenShare.toggle();
    setScreenSharing((prev) => !prev);
  }, []);

  const onToggleChat = useCallback(
    () => setSidebar((prev) => (prev === "chat" ? null : "chat")),
    [],
  );
  const onToggleParticipants = useCallback(
    () =>
      setSidebar((prev) => (prev === "participants" ? null : "participants")),
    [],
  );
  const onToggleSettings = useCallback(
    () => setSidebar((prev) => (prev === "settings" ? null : "settings")),
    [],
  );

  const canScreenShare = useMemo(
    () => typeof call?.screenShare?.toggle === "function",
    [call],
  );

  // ── Derived display values ─────────────────────────────────────────────────
  const duration = formatDuration(now - startedAt);
  const meetingTitle = `Consultation ${appointmentId?.slice?.(-6) ?? "Room"}`;
  const networkText =
    connectionState === "connected"
      ? "Stable"
      : connectionState === "reconnecting"
        ? "Reconnecting"
        : "Disconnected";
  const networkClass =
    connectionState === "connected"
      ? "text-primary"
      : connectionState === "reconnecting"
        ? "text-accent-foreground"
        : "text-destructive";

  // CSS Grid columns — animates smoothly when sidebar opens/closes
  const gridColumns =
    isSidebarOpen && !isMobile
      ? `minmax(0,1fr) ${sidebarWidth}px`
      : "minmax(0,1fr)";

  // Entries for expanded modal — only recomputes when expandedId or entries change
  const expandedEntries = useMemo(
    () => entries.filter((e) => e.participant.id === expandedId),
    [entries, expandedId],
  );

  return (
    <div className="relative grid h-dvh w-full grid-rows-[auto_1fr] overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,20,20,0.06),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(20,20,20,0.14),transparent_52%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_52%)]" />

      <JoinNotification />

      {connectionToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border border-border/60 bg-card/90 px-4 py-2 text-sm text-foreground backdrop-blur-md"
        >
          {connectionToast}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="fixed left-1/2 top-32 z-50 -translate-x-1/2 rounded-xl border border-destructive/40 bg-destructive/15 px-4 py-2 text-sm text-destructive backdrop-blur-md"
        >
          {actionError}
        </div>
      )}

      <StatusBar
        meetingTitle={meetingTitle}
        duration={duration}
        recording={Boolean(call?.state?.recording)}
        networkText={networkText}
        networkClass={networkClass}
        participantCount={entries.length}
        onOpenSettings={onToggleSettings}
      />

      <div className="relative min-h-0 px-3 pb-28 pt-2 sm:px-6 sm:pb-32">
        <div
          className="grid h-full min-h-0 gap-3 transition-[grid-template-columns] duration-300"
          style={{ gridTemplateColumns: gridColumns }}
        >
          <div className="min-h-0 overflow-hidden">
            <VideoGrid
              entries={entries}
              localUserId={currentUserId}
              activeSpeakerId={activeSpeakerId}
              pinnedId={pinnedId}
              sidebarOpen={isSidebarOpen}
              isMobile={isMobile}
              isHost={isHost}
              screenSharing={screenSharing}
              onMute={onMuteParticipant}
              onPin={onPin}
              onExpand={onExpand}
            />
          </div>

          {!isMobile && (
            <SidebarPanel
              panel={sidebar}
              isMobile={false}
              entries={sortedEntries}
              localUserId={currentUserId}
              activeSpeakerId={activeSpeakerId}
              isHost={isHost}
              chatMessages={chatMessages}
              chatInput={chatInput}
              onChatInput={setChatInput}
              onChatSend={sendChat}
              onMute={onMuteParticipant}
              onClose={closeSidebar}
            />
          )}
        </div>

        {isMobile && sidebar && (
          <SidebarPanel
            panel={sidebar}
            isMobile
            entries={sortedEntries}
            localUserId={currentUserId}
            activeSpeakerId={activeSpeakerId}
            isHost={isHost}
            chatMessages={chatMessages}
            chatInput={chatInput}
            onChatInput={setChatInput}
            onChatSend={sendChat}
            onMute={onMuteParticipant}
            onClose={closeSidebar}
          />
        )}
      </div>

      <ControlBar
        isMicMuted={isMicMuted}
        isCameraMuted={isCameraMuted}
        isScreenSharing={screenSharing}
        isHandRaised={handRaised}
        sidebar={sidebar}
        onMic={onMic}
        onCamera={onCamera}
        onScreenShare={onScreenShare}
        onToggleChat={onToggleChat}
        onToggleParticipants={onToggleParticipants}
        onToggleSettings={onToggleSettings}
        onRaiseHand={onRaiseHand}
        onEnd={leaveCall}
        canScreenShare={canScreenShare}
      />

      {(!isDoctorPresent || !isPatientPresent) && (
        <div className="pointer-events-none fixed left-1/2 top-[5.2rem] z-30 -translate-x-1/2 rounded-full border border-border/60 bg-card/85 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
          Waiting for all participants to be present
        </div>
      )}

      {expandedId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Expanded participant view"
          className="fixed inset-0 z-50 bg-background/80 p-6 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={onCloseExpanded}
            className="absolute right-5 top-5 rounded-full border border-border/60 bg-card/85 px-4 py-2 text-sm text-foreground hover:bg-card"
            aria-label="Close expanded view"
          >
            Close
          </button>
          <div className="mx-auto mt-10 h-[calc(100%-4rem)] max-w-6xl">
            <VideoGrid
              entries={expandedEntries}
              localUserId={currentUserId}
              activeSpeakerId={activeSpeakerId}
              pinnedId={pinnedId}
              sidebarOpen={false}
              isMobile={false}
              isHost={isHost}
              screenSharing={false}
              onMute={onMuteParticipant}
              onPin={onPin}
              onExpand={onCloseExpanded}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(VideoMeetingLayout);
