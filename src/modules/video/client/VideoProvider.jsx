"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";

const VideoContext = createContext(null);

// Only applies to the Stream SDK join — fetch uses native AbortController
const JOIN_CALL_TIMEOUT_MS = 20000;

function withTimeout(promise, ms, msg) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(msg)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function toParticipantModel(raw) {
  if (!raw) return null;
  const id = raw.userId || raw.user_id || raw.id || raw.sessionId || null;
  if (!id) return null;
  return {
    id,
    name: raw.name || raw.user?.name || raw.userName || "Participant",
    role: raw.role || raw.user?.role || "unknown",
    micOn:
      typeof raw.audioEnabled === "boolean"
        ? raw.audioEnabled
        : !raw.isAudioMuted,
    cameraOn:
      typeof raw.videoEnabled === "boolean"
        ? raw.videoEnabled
        : !raw.isVideoMuted,
    isSpeaking: Boolean(raw.isSpeaking),
    // Use raw.joinedAt when available; fall back to the call time recorded by
    // the SDK event rather than Date.now() so upsertParticipant doesn't
    // stamp a new timestamp on every participant.updated event.
    joinedAt:
      raw.joinedAt instanceof Date
        ? raw.joinedAt.getTime()
        : (raw.joinedAt ?? Date.now()),
  };
}

function deriveCallState({
  explicitState,
  connectionState,
  participantsCount,
}) {
  if (explicitState === "ended") return "ended";
  if (connectionState === "reconnecting") return "reconnecting";
  if (explicitState === "joining") return "joining";
  if (participantsCount >= 2) return "active";
  if (participantsCount === 1) return "waiting-participant";
  return "idle";
}

export function VideoProvider({ appointmentId, fallbackName, children }) {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connectionState, setConnectionState] = useState("connecting");
  const [explicitCallState, setExplicitCallState] = useState("idle");
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const cleanupRef = useRef([]);
  const callRef = useRef(null);
  const isJoiningRef = useRef(false);

  // NO initializingRef — it caused React StrictMode double-invoke deadlock where
  // the second mount returned early AND the first mount never called setLoading(false)
  // (isMounted was false). The AbortController + isMounted pattern is the correct fix.

  const log = useCallback(
    (event, payload = {}) => {
      if (process.env.NODE_ENV !== "production") {
        console.info("[video]", { event, appointmentId, ...payload });
      }
    },
    [appointmentId],
  );

  const resetCleanup = useCallback(() => {
    cleanupRef.current.forEach((fn) => {
      try {
        fn();
      } catch {
        // no-op
      }
    });
    cleanupRef.current = [];
  }, []);

  const upsertParticipant = useCallback((nextParticipant) => {
    if (!nextParticipant) return;

    setParticipants((prev) => {
      const index = prev.findIndex((p) => p.id === nextParticipant.id);
      if (index === -1) {
        return [...prev, nextParticipant];
      }

      const exists = prev[index];
      const merged = {
        ...exists,
        ...nextParticipant,
        joinedAt: exists.joinedAt || nextParticipant.joinedAt,
      };

      // Ignore no-op updates (common on high-frequency Stream SDK events).
      // Provider only needs stable participant presence/identity here.
      const changed =
        exists.name !== merged.name ||
        exists.role !== merged.role ||
        exists.micOn !== merged.micOn ||
        exists.cameraOn !== merged.cameraOn ||
        exists.joinedAt !== merged.joinedAt;

      if (!changed) return prev;

      const next = [...prev];
      next[index] = merged;
      return next;
    });
  }, []);

  const removeParticipant = useCallback((participantId) => {
    if (!participantId) return;
    setParticipants((prev) => prev.filter((p) => p.id !== participantId));
  }, []);

  const setConnectionStateSafe = useCallback((nextState) => {
    if (!nextState) return;
    setConnectionState((prev) => (prev === nextState ? prev : nextState));
  }, []);

  const setExplicitCallStateSafe = useCallback((nextState) => {
    if (!nextState) return;
    setExplicitCallState((prev) => (prev === nextState ? prev : nextState));
  }, []);

  const leaveCall = useCallback(async () => {
    const activeCall = callRef.current;
    if (!activeCall) return;
    try {
      await activeCall.leave();
      setExplicitCallStateSafe("ended");
      setParticipants([]);
      setConnectionStateSafe("disconnected");
      log("call.left.manual");
    } catch (err) {
      log("call.left.error", { message: err?.message });
    }
  }, [log, setConnectionStateSafe, setExplicitCallStateSafe]);

  const retryJoin = useCallback(() => {
    setClient(null);
    setCall(null);
    setError("");
    setParticipants([]);
    setCurrentUser(null);
    setExplicitCallState("idle");
    setConnectionState("connecting");
    callRef.current = null;
    isJoiningRef.current = false;
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const activeCall = callRef.current;
      if (!activeCall) return;
      activeCall.leave().catch(() => {});
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    // ─── FIX: No initializingRef here. ────────────────────────────────────────
    // initializingRef caused a React StrictMode deadlock:
    //   mount-1 → sets ref=true, starts initCall()
    //   cleanup  → isMounted=false (ref still true!)
    //   mount-2  → ref=true → initCall() returns early (never runs!)
    //   mount-1 finishes → isMounted=false → setLoading(false) never fires
    //   Result: loading=true forever
    //
    // Correct pattern: AbortController for cancellation + isMounted for guard.
    // On cleanup, abort the fetch (fast) and mark isMounted=false.
    // mount-2 gets a fresh controller and runs normally.
    // ──────────────────────────────────────────────────────────────────────────
    let isMounted = true;
    let streamClient = null;
    let streamCall = null;
    const controller = new AbortController();

    function on(sc, event, handler) {
      const unsub = sc?.on?.(event, handler);
      if (typeof unsub === "function") cleanupRef.current.push(unsub);
    }

    async function initCall() {
      if (isJoiningRef.current) {
        log("call.init.skipped.already-joining");
        return;
      }
      isJoiningRef.current = true;

      setLoading(true);
      setError("");
      setExplicitCallStateSafe("joining");
      setConnectionStateSafe("connecting");

      try {
        const tokenRes = await fetch("/api/video/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ appointmentId }),
          signal: controller.signal,
        });

        // If aborted or unmounted during fetch, silently stop
        if (!isMounted || controller.signal.aborted) return;

        const tokenData = await tokenRes.json();
        if (!tokenRes.ok) {
          throw new Error(tokenData?.error || "Unable to join consultation");
        }

        const user = {
          id: tokenData.userId,
          name: tokenData.userName || fallbackName || "Shifa User",
          role: tokenData.userRole || "unknown",
        };

        streamClient = new StreamVideoClient({
          apiKey: tokenData.apiKey,
          user,
          token: tokenData.token,
        });

        streamCall = streamClient.call("default", tokenData.callId);

        on(streamCall, "call.joined", () => {
          if (isMounted) {
            log("call.joined", { userId: user.id });
            setExplicitCallStateSafe("waiting-participant");
          }
        });
        on(streamCall, "call.left", () => {
          if (isMounted) {
            log("call.left");
            setExplicitCallStateSafe("ended");
          }
        });
        on(streamCall, "call.session_started", () => {
          if (isMounted) setExplicitCallStateSafe("active");
        });
        on(streamCall, "call.session_ended", () => {
          if (isMounted) setExplicitCallStateSafe("ended");
        });
        on(streamCall, "connection.state_changed", (event) => {
          if (!isMounted) return;
          setConnectionStateSafe(
            event?.connectionState || event?.state || "connected",
          );
        });
        on(streamCall, "participant.joined", (event) => {
          if (isMounted)
            upsertParticipant(toParticipantModel(event?.participant));
        });
        on(streamCall, "participant.left", (event) => {
          if (isMounted)
            removeParticipant(
              event?.participant?.userId || event?.participant?.user_id,
            );
        });
        // Avoid subscribing to participant.updated here because Stream emits
        // high-frequency updates (e.g., speaking/quality) that would trigger
        // provider-level state churn and cascade re-renders.

        const callState = streamCall?.state?.callingState;
        const alreadyJoined = callState === "joined" || callState === "joining";
        if (!alreadyJoined) {
          await withTimeout(
            streamCall.join({ create: true }),
            JOIN_CALL_TIMEOUT_MS,
            "Joining call timed out. Please check your connection and try again.",
          );
        } else {
          log("call.join.skipped", { callState });
        }

        if (!isMounted) return;

        setClient(streamClient);
        setCall(streamCall);
        setCurrentUser(user);
        setConnectionStateSafe("connected");
        upsertParticipant({
          id: user.id,
          name: user.name,
          role: user.role,
          micOn: true,
          cameraOn: true,
          isSpeaking: false,
          joinedAt: Date.now(),
        });
        log("call.ready", { userId: user.id, role: user.role });
      } catch (initError) {
        // Ignore if we were aborted/unmounted — not a real error
        if (!isMounted || initError?.name === "AbortError") return;

        const message =
          initError?.message || "Unable to initialize consultation";
        log("call.init.error", { message });

        if (/permission|notallowederror|denied/i.test(message)) {
          setError(
            "Camera or microphone permission was denied. Please allow device access and try again.",
          );
        } else if (
          /AuthErrorTokenUsedBeforeIssuedAt|used before issue at|\biat\b/i.test(
            message,
          )
        ) {
          setError(
            "Video token time validation failed. Please refresh and try again. If the issue continues, check server time synchronization.",
          );
        } else if (/timeout/i.test(message)) {
          setError(
            "Connection timed out. Please check your internet and try again.",
          );
        } else {
          setError(message);
        }

        setExplicitCallStateSafe("ended");
      } finally {
        isJoiningRef.current = false;
        // Always unblock loading — isMounted guard prevents stale update
        if (isMounted) setLoading(false);
      }
    }

    initCall();

    return () => {
      isMounted = false;
      isJoiningRef.current = false;
      controller.abort(); // cancel in-flight fetch instantly
      resetCleanup(); // remove SDK event listeners
      if (streamCall) streamCall.leave().catch(() => {});
      if (streamClient) streamClient.disconnectUser().catch(() => {});
    };
  }, [
    appointmentId,
    fallbackName,
    log,
    upsertParticipant,
    removeParticipant,
    resetCleanup,
    setConnectionStateSafe,
    setExplicitCallStateSafe,
    retryKey,
  ]);

  const callState = deriveCallState({
    explicitState: explicitCallState,
    connectionState,
    participantsCount: participants.length,
  });

  const isDoctorPresent = useMemo(
    () => participants.some((p) => p.role === "doctor"),
    [participants],
  );
  const isPatientPresent = useMemo(
    () => participants.some((p) => p.role === "patient"),
    [participants],
  );

  const waitingLabel = useMemo(() => {
    if (callState !== "waiting-participant") return null;
    return currentUser?.role === "doctor"
      ? "Waiting for patient to join"
      : "Waiting for doctor to join";
  }, [callState, currentUser?.role]);

  const value = useMemo(
    () => ({
      client,
      call,
      loading,
      error,
      // participants is intentionally NOT in the context value.
      // It changes on every audio-level SDK update (up to 60fps), which would
      // cause every context consumer (VideoRoom, JoinNotification) to re-render
      // at the same rate, cascading into a render loop.
      // Consumers that need live participant data should use useParticipants()
      // from @stream-io/video-react-sdk inside a StreamCall context instead.
      currentUser,
      callState,
      connectionState,
      waitingLabel,
      isDoctorPresent,
      isPatientPresent,
      leaveCall,
      retryJoin,
      appointmentId,
    }),
    [
      appointmentId,
      call,
      callState,
      client,
      connectionState,
      currentUser,
      error,
      isDoctorPresent,
      isPatientPresent,
      leaveCall,
      retryJoin,
      loading,
      waitingLabel,
    ],
  );

  return (
    <VideoContext.Provider value={value}>{children}</VideoContext.Provider>
  );
}

export function useVideoContext() {
  const ctx = useContext(VideoContext);
  if (!ctx) {
    throw new Error("useVideoContext must be used inside VideoProvider");
  }
  return ctx;
}
