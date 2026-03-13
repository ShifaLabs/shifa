"use client";

import {
  StreamVideo,
  StreamCall,
  ParticipantView,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { memo } from "react";
import ParticipantTile from "./ParticipantTile";

// Dynamic grid layout based on participant count
const getGridLayout = (count) => {
  if (count === 0) return "grid-cols-1";
  if (count === 1) return "grid-cols-1 lg:grid-cols-1";
  if (count === 2) return "grid-cols-1 lg:grid-cols-2";
  if (count <= 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";
  if (count <= 6) return "grid-cols-2 md:grid-cols-3 lg:grid-cols-3";
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
};

// Determine if we should show full-screen speaker layout
const shouldUseSpeakerLayout = (count) => count <= 2;

function VideoGrid({ client, call, participants, showParticipants = true }) {
  const { useParticipants } = useCallStateHooks();
  const allParticipants = useParticipants();
  const count = participants?.length || 0;

  // Calculate grid size
  const gridColsClass = getGridLayout(count);
  const isFullscreen = count === 1;
  const isSideBySide = count === 2;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        {/* FULLSCREEN LAYOUT (1 participant) */}
        {isFullscreen && (
          <div className="relative h-full w-full overflow-hidden rounded-3xl bg-card">
            <ParticipantView participant={allParticipants[0]} />
            {/* Subtle gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/30 via-transparent to-transparent" />
          </div>
        )}

        {/* SIDE-BY-SIDE LAYOUT (2 participants) */}
        {isSideBySide && (
          <div className="grid h-full w-full grid-cols-1 gap-3 md:grid-cols-2">
            {allParticipants.map((participant, idx) => (
              <div
                key={participant.sessionId}
                className="group relative animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/15"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ParticipantView participant={participant} />

                {/* Gradient overlay + participant info */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 pointer-events-none">
                  <ParticipantTile
                    participant={participants.find(
                      (p) =>
                        p.id === participant.userId ||
                        p.id === participant.user_id,
                    )}
                  />
                </div>

                {/* Hover border effect */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border border-primary/0 transition-colors duration-300 group-hover:border-primary/40" />
              </div>
            ))}
          </div>
        )}

        {/* GRID LAYOUT (3+ participants) */}
        {!isFullscreen && !isSideBySide && (
          <div
            className={`grid h-full w-full gap-3 grid-cols-1 md:grid-cols-2 lg:${gridColsClass} auto-rows-fr`}
          >
            {allParticipants.map((participant, idx) => (
              <div
                key={participant.sessionId}
                className={`group relative animate-in fade-in zoom-in-95 overflow-hidden rounded-3xl bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/15 ${
                  idx === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <ParticipantView participant={participant} />

                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent" />

                {/* User info card */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-4 pointer-events-none">
                  <ParticipantTile
                    participant={participants.find(
                      (p) =>
                        p.id === participant.userId ||
                        p.id === participant.user_id,
                    )}
                  />
                </div>

                {/* Hover border effect */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl border border-primary/0 transition-colors duration-300 group-hover:border-primary/40" />
              </div>
            ))}
          </div>
        )}
      </StreamCall>
    </StreamVideo>
  );
}

export default memo(VideoGrid);
