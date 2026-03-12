"use client";

import { memo, useEffect, useRef, useState } from "react";
import { LogIn, LogOut } from "lucide-react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

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
    .map((sp) => sp.userId)
    .filter(Boolean)
    .sort()
    .join(",");

  // Keep the latest participant list accessible in the effect without adding it
  // as a dep (which would re-run the effect on every audio update).
  const latestParticipantsRef = useRef(participants);
  latestParticipantsRef.current = participants;
  const mountedRef = useRef(true);
  const timeoutIdsRef = useRef([]);

  const prevIdsRef = useRef(new Set());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const current = latestParticipantsRef.current;
    const currentIds = new Set(current.map((sp) => sp.userId).filter(Boolean));
    const prevIds = prevIdsRef.current;

    // Detect joins
    current.forEach((sp) => {
      const id = sp.userId;
      if (!id) return;
      if (!prevIds.has(id)) {
        const notifId = Math.random();
        setNotifications((prev) => [
          ...prev,
          {
            id: notifId,
            type: "join",
            name: sp.name ?? sp.user?.name ?? "Participant",
          },
        ]);
        const timeoutId = setTimeout(() => {
          if (!mountedRef.current) return;
          setNotifications((prev) => prev.filter((n) => n.id !== notifId));
        }, 4000);
        timeoutIdsRef.current.push(timeoutId);
      }
    });

    // Detect leaves
    prevIds.forEach((prevId) => {
      if (!currentIds.has(prevId)) {
        const notifId = Math.random();
        setNotifications((prev) => [
          ...prev,
          { id: notifId, type: "leave", name: "Participant" },
        ]);
        const timeoutId = setTimeout(() => {
          if (!mountedRef.current) return;
          setNotifications((prev) => prev.filter((n) => n.id !== notifId));
        }, 3000);
        timeoutIdsRef.current.push(timeoutId);
      }
    });

    prevIdsRef.current = currentIds;
  }, [participantIdsKey]);

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-40 flex max-w-xs -translate-x-1/2 flex-col gap-2 px-4">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex animate-in items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl duration-300 fade-in slide-in-from-top-2 ${
            notif.type === "join"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
              : "border-red-500/30 bg-red-500/10 text-red-100"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-current/20">
            {notif.type === "join" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{notif.name}</p>
            <p className="text-xs opacity-80">
              {notif.type === "join"
                ? "joined the meeting"
                : "left the meeting"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(JoinNotification);
