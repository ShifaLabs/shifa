"use client";

import { useEffect, useState, memo, useRef } from "react";
import { LogIn, LogOut, UserCheck } from "lucide-react";
import { useVideoContext } from "./VideoProvider";

function JoinNotification() {
  const { participants } = useVideoContext();
  const lastParticipantsRef = useRef([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const lastParticipants = lastParticipantsRef.current;

    // Detect new joins
    const newParticipants = participants.filter(
      (p) => !lastParticipants.find((lp) => lp.id === p.id),
    );

    // Detect leaves
    const leftParticipants = lastParticipants.filter(
      (p) => !participants.find((np) => np.id === p.id),
    );

    newParticipants.forEach((p) => {
      const id = Math.random();
      setNotifications((prev) => [
        ...prev,
        {
          id,
          type: "join",
          name: p.name,
          role: p.role,
        },
      ]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    });

    leftParticipants.forEach((p) => {
      const id = Math.random();
      setNotifications((prev) => [
        ...prev,
        {
          id,
          type: "leave",
          name: p.name,
          role: p.role,
        },
      ]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    });

    lastParticipantsRef.current = participants;
  }, [participants]);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 pointer-events-none max-w-xs px-4">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 fade-in duration-300 ${
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
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{notif.name}</p>
            <p className="text-xs opacity-80">
              {notif.type === "join" ? "joined as" : "left"}{" "}
              <span className="font-medium">{notif.role}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(JoinNotification);
