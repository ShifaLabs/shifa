import { useCallback, useRef, useState } from "react";
import { haversineDistanceKm } from "../utils/distance";
import type { NearbyHospital, Position } from "../utils/types";

function isValidCoordinate(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function isWithinBangladesh(lat: number, lng: number) {
  return isValidCoordinate(lat, 20, 27) && isValidCoordinate(lng, 88, 93);
}

export function useNearbyHospitals() {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<Position | null>(null);
  const lastRadiusRef = useRef<number | null>(null);
  const inFlightRequestKeyRef = useRef<string | null>(null);

  const fetchHospitals = useCallback(
    async (position: Position | null, radius: number) => {
      if (!position) return;

      const requestKey = `${position.lat.toFixed(4)}:${position.lng.toFixed(4)}:${radius}`;
      if (inFlightRequestKeyRef.current === requestKey) {
        return;
      }

      const radiusChanged = lastRadiusRef.current !== radius;
      const movedEnough =
        !lastFetchRef.current ||
        haversineDistanceKm(
          lastFetchRef.current.lat,
          lastFetchRef.current.lng,
          position.lat,
          position.lng,
        ) *
          1000 >=
          300;

      if (!radiusChanged && !movedEnough) {
        return;
      }

      inFlightRequestKeyRef.current = requestKey;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          lat: String(position.lat),
          lng: String(position.lng),
          radius: String(radius),
        });

        const res = await fetch(`/api/hospitals/nearby?${query.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          throw new Error(data?.error || "Failed to fetch nearby hospitals");
        }

        const rows = Array.isArray(data?.data?.hospitals)
          ? data.data.hospitals
          : [];

        const sanitized: NearbyHospital[] = rows
          .map((h: any) => ({
            id: String(h?.id || ""),
            name: String(h?.name || "Unnamed Hospital"),
            lat: Number(h?.lat),
            lng: Number(h?.lng),
          }))
          .filter((h) => h.id && isWithinBangladesh(h.lat, h.lng));

        setHospitals(sanitized);
        lastFetchRef.current = position;
        lastRadiusRef.current = radius;
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to fetch nearby hospitals");
        }
      } finally {
        if (inFlightRequestKeyRef.current === requestKey) {
          inFlightRequestKeyRef.current = null;
        }
        setLoading(false);
      }
    },
    [],
  );

  const clearHospitals = useCallback(() => {
    setHospitals([]);
  }, []);

  return { hospitals, loading, error, fetchHospitals, clearHospitals };
}
