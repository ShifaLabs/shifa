"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";
import type { NearbyHospitalWithDistance, Position } from "../utils/types";
import UserMarker from "./UserMarker";
import RadiusCircle from "./RadiusCircle";
import HospitalMarkers from "./HospitalMarkers";
import RecenterMap from "./RecenterMap";
import FixMapResize from "./FixMapResize";
import { haversineDistanceKm } from "../utils/distance";

const BANGLADESH_CENTER = [23.685, 90.3563] as const;
const DEFAULT_ZOOM = 7;
const USER_ZOOM = 13;
const PAN_AWAY_THRESHOLD_METERS = 60;

const MapContainerAny: any = MapContainer;
const TileLayerAny: any = TileLayer;

function isWithinBangladesh(lat: number, lng: number) {
  return lat >= 20 && lat <= 27 && lng >= 88 && lng <= 93;
}

function PanAwayTracker({
  position,
  ignoreMoveEndRef,
  onPanAwayChange,
}: {
  position: Position | null;
  ignoreMoveEndRef: MutableRefObject<boolean>;
  onPanAwayChange: (pannedAway: boolean) => void;
}) {
  useMapEvents({
    moveend: (event) => {
      if (!position) {
        onPanAwayChange(false);
        return;
      }

      if (ignoreMoveEndRef.current) {
        ignoreMoveEndRef.current = false;
        return;
      }

      const center = event.target.getCenter();
      const distanceMeters =
        haversineDistanceKm(
          center.lat,
          center.lng,
          position.lat,
          position.lng,
        ) * 1000;

      onPanAwayChange(distanceMeters > PAN_AWAY_THRESHOLD_METERS);
    },
  });

  return null;
}

export default function MapView({
  position,
  hospitals,
  radius,
  permissionState,
  onRequestLocation,
}: {
  position: Position | null;
  hospitals: NearbyHospitalWithDistance[];
  radius: number;
  permissionState?: "idle" | "pending" | "granted" | "denied" | "error";
  onRequestLocation?: () => void;
}) {
  const [isPannedAway, setIsPannedAway] = useState(false);
  const [manualRecenterRequestId, setManualRecenterRequestId] = useState(-1);
  const ignoreMoveEndRef = useRef(false);

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

  const handlePanAwayChange = useCallback((pannedAway: boolean) => {
    setIsPannedAway((previous) => {
      if (previous === pannedAway) {
        return previous;
      }

      return pannedAway;
    });
  }, []);

  const handleManualRecenter = useCallback(() => {
    if (!position) {
      return;
    }

    ignoreMoveEndRef.current = true;
    setIsPannedAway(false);
    setManualRecenterRequestId((current) => current + 1);
  }, [position]);

  const handleMapButtonClick = useCallback(() => {
    if (position) {
      handleManualRecenter();
      return;
    }

    onRequestLocation?.();
  }, [position, handleManualRecenter, onRequestLocation]);

  const mapButtonLabel = position
    ? "You are here"
    : permissionState === "pending"
      ? "Requesting location..."
      : "Enable location";

  const isMapButtonDisabled = !position && permissionState === "pending";

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

        <PanAwayTracker
          position={position}
          ignoreMoveEndRef={ignoreMoveEndRef}
          onPanAwayChange={handlePanAwayChange}
        />

        <RecenterMap
          position={position}
          shouldAutoCenter={!isPannedAway}
          recenterRequestId={manualRecenterRequestId}
        />

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

      <div className="absolute bottom-6 right-6 z-500">
        <button
          type="button"
          onClick={handleMapButtonClick}
          disabled={isMapButtonDisabled}
          className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-md transition hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          {mapButtonLabel}
        </button>
      </div>

      {position ? (
        <div className="pointer-events-none absolute right-6 top-6 rounded-lg bg-white/90 px-3 py-2 text-xs text-gray-700 shadow">
          Live mode: auto-centering at zoom {USER_ZOOM}
        </div>
      ) : null}
    </div>
  );
}
