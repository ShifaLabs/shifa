"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoTile from "./VideoTile";

function clsx(...values) {
  return values.filter(Boolean).join(" ");
}

const MIN_TILE = 180;
const MAX_TILE = 340;

function VideoGrid({
  entries,
  localUserId,
  activeSpeakerId,
  pinnedId,
  sidebarOpen,
  isMobile,
  isHost,
  screenSharing,
  onMute,
  onPin,
  onExpand,
}) {
  const [page, setPage] = useState(0);

  const sortedEntries = useMemo(() => {
    const list = [...entries].sort((a, b) => {
      if (a.participant.id === pinnedId) return -1;
      if (b.participant.id === pinnedId) return 1;
      if (a.participant.id === activeSpeakerId) return -1;
      if (b.participant.id === activeSpeakerId) return 1;
      return a.participant.name.localeCompare(b.participant.name);
    });
    return list;
  }, [activeSpeakerId, entries, pinnedId]);

  const tileMin = useMemo(() => {
    if (isMobile) return 220;
    const sidebarPenalty = sidebarOpen && !isMobile ? 22 : 0;
    const baseDesktopTile = 260;
    const candidate = baseDesktopTile - sidebarPenalty;
    return Math.max(MIN_TILE, Math.min(MAX_TILE, candidate));
  }, [isMobile, sidebarOpen]);

  const virtualizationSize = useMemo(() => {
    if (isMobile) return 8;
    if (sidebarOpen) return 9;
    return 12;
  }, [isMobile, sidebarOpen]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedEntries.length / virtualizationSize),
  );

  // safePage clamps the current page to the valid range without needing a
  // useEffect. When entries shrink (participant leaves), totalPages decreases
  // and safePage automatically adjusts on the next render. The stale `page`
  // value is only reset when the user explicitly navigates.
  const safePage = Math.min(page, Math.max(0, totalPages - 1));

  const visibleEntries = useMemo(() => {
    const start = safePage * virtualizationSize;
    return sortedEntries.slice(start, start + virtualizationSize);
  }, [safePage, sortedEntries, virtualizationSize]);

  const pinnedEntry = useMemo(
    () =>
      sortedEntries.find((item) => item.participant.id === pinnedId) || null,
    [pinnedId, sortedEntries],
  );

  const screenSharePrimary = useMemo(() => {
    if (pinnedEntry) return pinnedEntry;
    return (
      sortedEntries.find((item) => item.participant.id === activeSpeakerId) ||
      sortedEntries[0] ||
      null
    );
  }, [activeSpeakerId, pinnedEntry, sortedEntries]);

  const screenShareStrip = useMemo(() => {
    if (!screenSharePrimary) return sortedEntries;
    return sortedEntries.filter(
      (item) => item.participant.id !== screenSharePrimary.participant.id,
    );
  }, [screenSharePrimary, sortedEntries]);

  // renderTile must be useCallback so VideoTile memo comparisons pass.
  // Inline arrow functions here recreate on every render, defeating React.memo.
  const renderTile = useCallback(
    (entry, showActions = true) => {
      const participantId = entry.participant.id;
      return (
        <VideoTile
          key={entry.streamParticipant.sessionId}
          streamParticipant={entry.streamParticipant}
          participant={entry.participant}
          isLocal={participantId === localUserId}
          isPinned={participantId === pinnedId}
          isActiveSpeaker={participantId === activeSpeakerId}
          showActions={showActions}
          canHostControl={isHost && participantId !== localUserId}
          onMute={onMute}
          onPin={onPin}
          onExpand={onExpand}
          pinParticipantId={participantId}
          expandParticipantId={participantId}
        />
      );
    },
    [localUserId, pinnedId, activeSpeakerId, isHost, onMute, onPin, onExpand],
  );

  if (isMobile) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
        <div className="min-h-0 flex-1">
          {screenSharePrimary && renderTile(screenSharePrimary, false)}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {screenShareStrip.map((entry) => (
            <div
              key={entry.streamParticipant.sessionId}
              className="w-44 shrink-0"
            >
              {renderTile(entry, false)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screenSharing && screenSharePrimary) {
    return (
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,70%)_minmax(0,30%)] gap-3 overflow-hidden">
        <div className="min-h-0">{renderTile(screenSharePrimary)}</div>
        <div className="min-h-0 space-y-3 overflow-y-scroll overflow-x-hidden pr-1">
          {screenShareStrip.map((entry) => renderTile(entry))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div
        className={clsx(
          "grid h-full min-h-0 gap-3 overflow-y-scroll overflow-x-hidden pr-1 transition-all duration-300",
          "auto-rows-max",
        )}
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${tileMin}px, 1fr))`,
        }}
      >
        {visibleEntries.map((entry) => renderTile(entry))}
      </div>

      {totalPages > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={safePage === 0}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
            aria-label="Previous grid page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-white/85">
            Page {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() =>
              setPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={safePage >= totalPages - 1}
            className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
            aria-label="Next grid page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(VideoGrid);
