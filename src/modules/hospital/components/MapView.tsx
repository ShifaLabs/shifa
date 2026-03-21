"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { NearbyHospitalWithDistance, Position } from "../utils/types";
import UserMarker from "./UserMarker";
import RadiusCircle from "./RadiusCircle";
import HospitalMarkers from "./HospitalMarkers";
import RecenterMap from "./RecenterMap";
import FixMapResize from "./FixMapResize";

const BANGLADESH_CENTER = [23.685, 90.3563] as const;
const DEFAULT_ZOOM = 7;
const USER_ZOOM = 13;

const MapContainerAny: any = MapContainer;
const TileLayerAny: any = TileLayer;

function isWithinBangladesh(lat: number, lng: number) {
  return lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93;
}

export default function MapView({
  position,
  hospitals,
  radius,
}: {
  position: Position | null;
  hospitals: NearbyHospitalWithDistance[];
  radius: number;
}) {
  const validHospitals = useMemo(() => {
    const filtered = hospitals.filter(
      (h) =>
        Number.isFinite(h.lat) &&
        Number.isFinite(h.lng) &&
        isWithinBangladesh(h.lat, h.lng),
    );

    // Prevent duplicate marker flicker from repeated upstream entries.
    const seen = new Set<string>();
    return filtered.filter((h) => {
      if (seen.has(h.id)) {
        return false;
      }
      seen.add(h.id);
      return true;
    });
  }, [hospitals]);

  const nearestHospitalId = useMemo(() => {
    if (validHospitals.length === 0) {
      return null;
    }

    return validHospitals.reduce((nearest, current) => {
      const nearestDistance =
        typeof nearest.distanceKm === "number"
          ? nearest.distanceKm
          : Number.POSITIVE_INFINITY;
      const currentDistance =
        typeof current.distanceKm === "number"
          ? current.distanceKm
          : Number.POSITIVE_INFINITY;

      return currentDistance < nearestDistance ? current : nearest;
    }).id;
  }, [validHospitals]);

  return (
    <div className="relative h-125 w-full overflow-hidden rounded-2xl border bg-white shadow-sm md:h-140">
      <MapContainerAny
        center={BANGLADESH_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="h-full w-full"
      >
        <FixMapResize />

        <TileLayerAny
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <RecenterMap position={position} />

        <UserMarker position={position} />
        <RadiusCircle position={position} radius={radius} />

        <HospitalMarkers
          hospitals={validHospitals}
          nearestHospitalId={nearestHospitalId}
        />
      </MapContainerAny>

      {!position ? (
        <div className="pointer-events-none absolute left-6 top-6 rounded-lg bg-white/90 px-3 py-2 text-xs text-gray-700 shadow">
          Showing Bangladesh overview. Allow location for nearby results.
        </div>
      ) : null}

      {position ? (
        <div className="pointer-events-none absolute right-6 top-6 rounded-lg bg-white/90 px-3 py-2 text-xs text-gray-700 shadow">
          Live mode: auto-centering at zoom {USER_ZOOM}
        </div>
      ) : null}
    </div>
  );
}
