import { useCallback, useRef, useState } from "react";
import { haversineDistanceKm } from "../utils/distance";

type Position = {
  lat: number;
  lng: number;
};

type PermissionState = "idle" | "pending" | "granted" | "denied" | "error";

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [permissionState, setPermissionState] =
    useState<PermissionState>("idle");
  const watchIdRef = useRef<number | null>(null);
  const lastEmittedPositionRef = useRef<Position | null>(null);

  const MIN_POSITION_UPDATE_METERS = 10;

  const emitPositionIfMeaningful = useCallback((nextPosition: Position) => {
    const previousPosition = lastEmittedPositionRef.current;

    if (!previousPosition) {
      lastEmittedPositionRef.current = nextPosition;
      setPosition(nextPosition);
      return;
    }

    const movedMeters =
      haversineDistanceKm(
        previousPosition.lat,
        previousPosition.lng,
        nextPosition.lat,
        nextPosition.lng,
      ) * 1000;

    if (movedMeters < MIN_POSITION_UPDATE_METERS) {
      return;
    }

    lastEmittedPositionRef.current = nextPosition;
    setPosition(nextPosition);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState("error");
      return;
    }

    setPermissionState("pending");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPermissionState("granted");
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        lastEmittedPositionRef.current = currentPosition;
        setPosition(currentPosition);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
          return;
        }

        setPermissionState("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      },
    );
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current !== null) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPermissionState("granted");
        emitPositionIfMeaningful({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setPermissionState("denied");
          return;
        }

        setPermissionState("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );
  }, [emitPositionIfMeaningful]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current === null || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
  }, []);

  return {
    position,
    permissionState,
    requestLocation,
    startWatching,
    stopWatching,
  };
}
