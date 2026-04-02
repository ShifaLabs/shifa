"use client";

import { useCallback, useRef, useState } from "react";

type Position = {
  lat: number;
  lng: number;
};

export type NearbyAmbulance = {
  providerId: string;
  providerName: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleType: "basic" | "icu";
  capabilities: string[];
  dispatchStatus: string;
  distanceMeters: number;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  locationSource: "live" | "base";
  locationFresh: boolean;
  lastLocationAt: string | Date | null;
};

const FETCH_MOVE_THRESHOLD_METERS = 250;

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMeters(a: Position, b: Position) {
  const earthRadius = 6371e3;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const calc =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
}

export function useNearbyAmbulances() {
  const [ambulances, setAmbulances] = useState<NearbyAmbulance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const lastFetchPositionRef = useRef<Position | null>(null);
  const inFlightKeyRef = useRef<string | null>(null);
  const lastRadiusRef = useRef<number | null>(null);
  const lastVehicleTypeRef = useRef<string | null>(null);

  const fetchNearbyAmbulances = useCallback(
    async (params: {
      position: Position | null;
      radiusMeters: number;
      vehicleType?: "basic" | "icu" | null;
    }) => {
      const { position, radiusMeters, vehicleType } = params;
      if (!position) {
        return;
      }

      const requestKey = `${position.lat.toFixed(4)}:${position.lng.toFixed(4)}:${radiusMeters}:${vehicleType}`;
      if (inFlightKeyRef.current === requestKey) {
        return;
      }

      const radiusChanged = lastRadiusRef.current !== radiusMeters;
      const typeChanged = lastVehicleTypeRef.current !== vehicleType;
      const movedEnough =
        !lastFetchPositionRef.current ||
        haversineMeters(lastFetchPositionRef.current, position) >=
          FETCH_MOVE_THRESHOLD_METERS;

      if (!radiusChanged && !typeChanged && !movedEnough) {
        return;
      }

      inFlightKeyRef.current = requestKey;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          lat: String(position.lat),
          lng: String(position.lng),
          radius: String(radiusMeters),
          limit: "8",
        });

        if (vehicleType) {
          query.set("vehicleType", vehicleType);
        }

        const res = await fetch(`/api/ambulance/search?${query.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json();

        if (!res.ok || json?.success === false) {
          throw new Error(
            json?.error || "Failed to fetch nearby ambulances right now",
          );
        }

        const rows = Array.isArray(json?.data?.ambulances)
          ? json.data.ambulances
          : [];

        const unique = new Map<string, NearbyAmbulance>();
        for (const row of rows) {
          const id = String(row?.vehicleId || "");
          if (!id || unique.has(id)) {
            continue;
          }

          unique.set(id, {
            providerId: String(row?.providerId || ""),
            providerName: String(row?.providerName || "Ambulance provider"),
            vehicleId: id,
            vehicleNumber: String(row?.vehicleNumber || "N/A"),
            vehicleType: row?.vehicleType === "icu" ? "icu" : "basic",
            capabilities: Array.isArray(row?.capabilities)
              ? row.capabilities.map((value: unknown) => String(value))
              : [],
            dispatchStatus: String(row?.dispatchStatus || "idle"),
            distanceMeters: Number(row?.distanceMeters || 0),
            location: {
              type: "Point",
              coordinates: [
                Number(row?.location?.coordinates?.[0]),
                Number(row?.location?.coordinates?.[1]),
              ],
            },
            locationSource: row?.locationSource === "live" ? "live" : "base",
            locationFresh: Boolean(row?.locationFresh),
            lastLocationAt: row?.lastLocationAt || null,
          });
        }

        setAmbulances(Array.from(unique.values()));
        lastFetchPositionRef.current = position;
        lastRadiusRef.current = radiusMeters;
        lastVehicleTypeRef.current = vehicleType;
        return Array.from(unique.values());
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setAmbulances([]);
          setError(err?.message || "Unable to load nearby ambulances");
        }
        return [];
      } finally {
        if (inFlightKeyRef.current === requestKey) {
          inFlightKeyRef.current = null;
        }
        setLoading(false);
      }
    },
    [],
  );

  return {
    ambulances,
    loading,
    error,
    fetchNearbyAmbulances,
    clearAmbulances: () => setAmbulances([]),
  };
}
