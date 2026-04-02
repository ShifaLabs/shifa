"use client";

import { useEffect, useRef, useState } from "react";

type Position = {
  lat: number;
  lng: number;
};

export function useAmbulanceLocationTracking({
  enabled,
  bookingId,
}: {
  enabled: boolean;
  bookingId?: string | null;
}) {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported in this browser.");
      }
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const nextPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(nextPosition);

        const now = Date.now();
        if (now - lastSentRef.current < 10_000) {
          return;
        }

        lastSentRef.current = now;
        try {
          const res = await fetch("/api/ambulance/providers/me/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentLocation: {
                type: "Point",
                coordinates: [nextPosition.lng, nextPosition.lat],
              },
              heading: pos.coords.heading,
              speedKph:
                typeof pos.coords.speed === "number" && pos.coords.speed >= 0
                  ? Math.round(pos.coords.speed * 3.6)
                  : null,
              accuracyMeters: pos.coords.accuracy,
              bookingId: bookingId || null,
            }),
          });

          if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            setError(
              json?.error ||
                "Live location update rejected by server. Check provider approval and online status.",
            );
          }
        } catch {
          setError("Failed to send live location update.");
        }
      },
      () => setError("Location permission denied or unavailable."),
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 5_000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [bookingId, enabled]);

  return { position, error };
}
