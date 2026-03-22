"use client";
import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyHospitals } from "../hooks/useNearbyHospitals";
import { haversineDistanceKm } from "../utils/distance";
import type { NearbyHospitalWithDistance } from "../utils/types";
import RadiusSelector from "./RadiusSelector";
import HospitalList from "./HospitalList";

const LazyMapView = lazy(() => import("./MapView"));

function MapLoadingFallback() {
  return (
    <div className="h-125 w-full rounded-2xl border bg-white flex items-center justify-center text-sm text-gray-500 md:h-140">
      Loading map...
    </div>
  );
}

export default function NearbyHospitalsClient() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [radius, setRadius] = useState(5000);

  const {
    position,
    permissionState,
    requestLocation,
    startWatching,
    stopWatching,
  } = useGeolocation();
  const { hospitals, loading, error, fetchHospitals, clearHospitals } =
    useNearbyHospitals();

  const locationButtonLabel = useMemo(() => {
    if (permissionState === "pending") {
      return "Requesting location...";
    }

    if (permissionState === "denied") {
      return "Re-enable location";
    }

    if (permissionState === "error") {
      return "Try location again";
    }

    return "Allow location";
  }, [permissionState]);

  const canShowLocationButton = permissionState !== "granted";

  useEffect(() => {
    requestLocation();
    startWatching();

    return () => {
      stopWatching();
    };
  }, [requestLocation, startWatching, stopWatching]);

  useEffect(() => {
    if (!position) {
      clearHospitals();
      return;
    }

    fetchHospitals(position, radius);
  }, [position, radius, fetchHospitals, clearHospitals]);

  const handleEnableLocation = () => {
    requestLocation();
    startWatching();
  };

  const hospitalsWithDistance: NearbyHospitalWithDistance[] = useMemo(() => {
    if (!position) {
      return hospitals.map((h) => ({
        ...h,
        distanceKm: Number.POSITIVE_INFINITY,
      }));
    }

    return [...hospitals]
      .map((h) => ({
        ...h,
        distanceKm: haversineDistanceKm(
          position.lat,
          position.lng,
          h.lat,
          h.lng,
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [hospitals, position]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-4">
      <RadiusSelector radius={radius} setRadius={setRadius} />

      {canShowLocationButton ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-sky-800">
              Enable location to see nearby hospitals and keep distance updates
              live.
            </p>
            <button
              type="button"
              onClick={handleEnableLocation}
              disabled={permissionState === "pending"}
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300"
            >
              {locationButtonLabel}
            </button>
          </div>
        </div>
      ) : null}

      {permissionState === "denied" ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Location permission denied. Please enable it and try again.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-600">Loading hospitals...</p>
      ) : null}

      {isHydrated ? (
        <Suspense fallback={<MapLoadingFallback />}>
          <LazyMapView
            position={position}
            hospitals={hospitalsWithDistance}
            radius={radius}
            permissionState={permissionState}
            onRequestLocation={handleEnableLocation}
          />
        </Suspense>
      ) : (
        <MapLoadingFallback />
      )}
      <HospitalList hospitals={hospitalsWithDistance} />
    </div>
  );
}
