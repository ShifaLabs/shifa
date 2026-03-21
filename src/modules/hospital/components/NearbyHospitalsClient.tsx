"use client";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyHospitals } from "../hooks/useNearbyHospitals";
import { haversineDistanceKm } from "../utils/distance";
import type { NearbyHospitalWithDistance } from "../utils/types";
import RadiusSelector from "./RadiusSelector";
import HospitalList from "./HospitalList";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-125 w-full rounded-2xl border bg-white flex items-center justify-center text-sm text-gray-500 md:h-140">
      Loading map...
    </div>
  ),
});

export default function NearbyHospitalsClient() {
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

      <MapView
        position={position}
        hospitals={hospitalsWithDistance}
        radius={radius}
      />
      <HospitalList hospitals={hospitalsWithDistance} />
    </div>
  );
}
