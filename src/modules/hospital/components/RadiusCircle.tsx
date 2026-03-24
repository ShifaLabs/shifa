"use client";

import { memo } from "react";
import { Circle } from "react-leaflet";

const CircleAny: any = Circle;

type Position = {
  lat: number;
  lng: number;
};

function RadiusCircle({
  position,
  radius,
}: {
  position: Position | null;
  radius: number;
}) {
  if (!position || !Number.isFinite(radius) || radius <= 0) {
    return null;
  }

  return (
    <CircleAny
      center={[position.lat, position.lng]}
      radius={radius}
      pathOptions={{
        color: "#0f766e",
        weight: 2,
        fillColor: "#99f6e4",
        fillOpacity: 0.22,
      }}
    />
  );
}

export default memo(RadiusCircle);
