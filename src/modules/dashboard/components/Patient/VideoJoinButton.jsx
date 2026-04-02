"use client";

import { useState } from "react";
import { Video, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";

export default function VideoJoinButton({ appointment }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV !== "production";

  const appointmentDate = new Date(appointment.appointmentDate);
  const now = new Date();
  const joinFrom = appointment?.videoSession?.joinFrom
    ? new Date(appointment.videoSession.joinFrom)
    : new Date(appointmentDate.getTime() - 10 * 60 * 1000);
  const joinUntil = appointment?.videoSession?.joinUntil
    ? new Date(appointment.videoSession.joinUntil)
    : new Date(appointmentDate.getTime() + 60 * 60 * 1000);

  const isBeforeJoinTime = now < joinFrom;
  const isAfterJoinTime = now > joinUntil;
  const canJoinNow = isDevelopment || (!isBeforeJoinTime && !isAfterJoinTime);
  const appointmentTimeText = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const joinFromText = joinFrom.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const joinUntilText = joinUntil.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleJoinCall = async () => {
    try {
      setLoading(true);
      setError(null);
      router.push(`/consultation/${appointment._id}`);
    } catch (err) {
      setError(err.message);
      console.error("Failed to join call:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isDevelopment && isBeforeJoinTime) {
    const minutesUntil = Math.ceil((joinFrom - now) / 60000);
    return (
      <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Clock className="w-5 h-5 text-blue-600" />
        <div className="text-sm">
          <p className="font-medium text-blue-900">
            Video call not yet available
          </p>
          <p className="text-blue-700">
            You can join {minutesUntil} minute{minutesUntil > 1 ? "s" : ""}{" "}
            before your appointment
          </p>
        </div>
      </div>
    );
  }

  if (!isDevelopment && isAfterJoinTime) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-gray-600" />
        <div className="text-sm">
          <p className="font-medium text-gray-900">Video call has ended</p>
          <p className="text-gray-700">This consultation window has closed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleJoinCall}
        disabled={loading || !canJoinNow}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
      >
        <Video className="w-5 h-5" />
        {loading ? "Joining..." : "Join Video Consultation"}
      </Button>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      <p className="text-xs text-gray-500">
        Scheduled at {appointmentTimeText}. Join window: {joinFromText} -{" "}
        {joinUntilText}
      </p>
    </div>
  );
}
