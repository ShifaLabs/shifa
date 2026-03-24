"use client";

import { memo, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const MarkerAny: any = Marker;

type Position = {
  lat: number;
  lng: number;
};

function UserMarker({ position }: { position: Position | null }) {
  const userIcon = useMemo(() => {
    try {
      return L.divIcon({
        className: "user-location-icon",
        html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#0f766e;border:3px solid #ccfbf1;box-shadow:0 0 0 4px rgba(15,118,110,0.25);"></span>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
    } catch {
      return undefined;
    }
  }, []);

  if (!position) {
    return null;
  }

  return userIcon ? (
    <MarkerAny position={[position.lat, position.lng]} icon={userIcon}>
      <Popup>You are here</Popup>
    </MarkerAny>
  ) : (
    <MarkerAny position={[position.lat, position.lng]}>
      <Popup>You are here</Popup>
    </MarkerAny>
  );
}

export default memo(UserMarker);
