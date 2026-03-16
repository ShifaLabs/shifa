"use client";

import { memo, useEffect, useRef } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const TOAST_DURATION_MS = 2500;
const EVENT_DEDUP_MS = 2500;

function getParticipantId(participant) {
  return (
    participant?.userId ||
    participant?.user_id ||
    participant?.id ||
    participant?.sessionId ||
    null
  );
}

function getParticipantName(participant) {
  return participant?.name ?? participant?.user?.name ?? "Participant";
}

/**
 * Detects participant join/leave events and shows transient toast notifications.
 *
 * Uses useParticipants() from the Stream SDK directly (not VideoContext) so that
 * audio-level updates do NOT cause this component or its parent to re-render.
 * The effect is keyed on a stable string (sorted user IDs) so it only fires when
 * the actual set of participants changes, not on every audio frame.
 */
function JoinNotification() {
  const { useParticipants } = useCallStateHooks();
  const streamParticipants = useParticipants();
  const participants = Array.isArray(streamParticipants)
    ? streamParticipants
    : [];

  // Stable key: sorted user IDs joined as a string.
  // Object.is comparison on this string means the effect only fires on real joins/leaves.
  const participantIdsKey = participants
    .map((sp) => getParticipantId(sp))
    .filter(Boolean)
    .sort()
    .join(",");

  // Keep the latest participant list accessible in the effect without adding it
  // as a dep (which would re-run the effect on every audio update).
  const latestParticipantsRef = useRef(participants);
  latestParticipantsRef.current = participants;

  const prevIdsRef = useRef(new Set());
  const prevNamesRef = useRef(new Map());
  const hasInitializedRef = useRef(false);
  const lastEventAtRef = useRef(new Map());

  const enqueueNotification = (type, name) => {
    const now = Date.now();
    const eventKey = `${type}:${name}`;
    const lastEventAt = lastEventAtRef.current.get(eventKey) ?? 0;

    if (now - lastEventAt < EVENT_DEDUP_MS) return;

    lastEventAtRef.current.set(eventKey, now);

    toast(name, {
      duration: TOAST_DURATION_MS,
      description:
        type === "join" ? "joined the meeting" : "left the meeting",
      icon:
        type === "join" ? <LogIn className="h-4 w-4" /> : <LogOut className="h-4 w-4" />,
    });
  };

  useEffect(() => {
    const current = latestParticipantsRef.current;
    const currentIds = new Set(current.map((sp) => getParticipantId(sp)).filter(Boolean));
    const currentNames = new Map(
      current
        .map((sp) => [getParticipantId(sp), getParticipantName(sp)])
        .filter(([id]) => Boolean(id)),
    );
    const prevIds = prevIdsRef.current;
    const prevNames = prevNamesRef.current;

    // Avoid showing join toasts for participants already in the room on first render.
    if (!hasInitializedRef.current) {
      prevIdsRef.current = currentIds;
      prevNamesRef.current = currentNames;
      hasInitializedRef.current = true;
      return;
    }

    // Detect joins
    current.forEach((sp) => {
      const id = getParticipantId(sp);
      if (!id) return;
      if (!prevIds.has(id)) {
        enqueueNotification("join", getParticipantName(sp));
      }
    });

    // Detect leaves
    prevIds.forEach((prevId) => {
      if (!currentIds.has(prevId)) {
        enqueueNotification("leave", prevNames.get(prevId) || "Participant");
      }
    });

    prevIdsRef.current = currentIds;
    prevNamesRef.current = currentNames;
  }, [participantIdsKey]);

  return (
    <Toaster position="top-center" duration={TOAST_DURATION_MS} closeButton={false} />
  );
}

export default memo(JoinNotification);
