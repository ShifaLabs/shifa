"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { haversineDistanceKm } from "../utils/distance";
import type { Position } from "../utils/types";

function RecenterMap({
  position,
  shouldAutoCenter = true,
  recenterRequestId,
}: {
  position: Position | null;
  shouldAutoCenter?: boolean;
  recenterRequestId?: number;
}) {
  const map = useMap();
  const hasMovedToUserRef = useRef(false);
  const lastAnimatedPositionRef = useRef<Position | null>(null);
  const lastManualRecenterRequestRef = useRef<number>(-1);

  const MIN_FLY_DISTANCE_METERS = 12;

  const flyToPosition = useCallback(
    (targetPosition: Position, duration: number) => {
      const targetZoom = 13;
      map.flyTo([targetPosition.lat, targetPosition.lng], targetZoom, {
        duration,
        easeLinearity: 0.25,
      });
    },
    [map],
  );

  useEffect(() => {
    if (!position || !shouldAutoCenter) {
      return;
    }

    const movedEnough =
      !lastAnimatedPositionRef.current ||
      haversineDistanceKm(
        lastAnimatedPositionRef.current.lat,
        lastAnimatedPositionRef.current.lng,
        position.lat,
        position.lng,
      ) *
        1000 >=
        MIN_FLY_DISTANCE_METERS;

    if (!movedEnough) {
      return;
    }

    flyToPosition(position, hasMovedToUserRef.current ? 0.9 : 1.4);

    hasMovedToUserRef.current = true;
    lastAnimatedPositionRef.current = position;
  }, [map, position, shouldAutoCenter, flyToPosition]);

  useEffect(() => {
    if (!position || typeof recenterRequestId !== "number") {
      return;
    }

    if (recenterRequestId === lastManualRecenterRequestRef.current) {
      return;
    }

    map.stop();
    flyToPosition(position, 0.9);

    hasMovedToUserRef.current = true;
    lastAnimatedPositionRef.current = position;
    lastManualRecenterRequestRef.current = recenterRequestId;
  }, [map, position, recenterRequestId, flyToPosition]);

  return null;
}

export default memo(RecenterMap);
