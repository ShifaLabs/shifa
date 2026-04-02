"use client";

import { useMemo } from "react";
import { useVideoContext } from "./VideoProvider";
import ParticipantTile from "./ParticipantTile";

export default function ParticipantGrid() {
  const { participants } = useVideoContext();

  const sortedParticipants = useMemo(() => {
    return [...participants].sort(
      (a, b) => (a.joinedAt || 0) - (b.joinedAt || 0),
    );
  }, [participants]);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {sortedParticipants.map((participant) => (
        <ParticipantTile key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
