"use client";

import { memo, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { haversineDistanceKm } from "../utils/distance";

type Position = {
  lat: number;
  lng: number;
};

function RecenterMap({ position }: { position: Position | null }) {
  const map = useMap();
  const hasMovedToUserRef = useRef(false);
  const lastAnimatedPositionRef = useRef<Position | null>(null);

  const MIN_FLY_DISTANCE_METERS = 12;

  useEffect(() => {
    if (!position) {
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

    const targetZoom = 13;
    map.flyTo([position.lat, position.lng], targetZoom, {
      duration: hasMovedToUserRef.current ? 0.9 : 1.4,
      easeLinearity: 0.25,
    });

    hasMovedToUserRef.current = true;
    lastAnimatedPositionRef.current = position;
  }, [map, position]);

  return null;
}

export default memo(RecenterMap);
