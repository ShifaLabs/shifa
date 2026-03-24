"use client";

import { memo, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Hospital = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm?: number;
};

function HospitalMarkers({
  hospitals,
  nearestHospitalId,
}: {
  hospitals: Hospital[];
  nearestHospitalId: string | null;
}) {
  const regularIcon = useMemo(() => {
    try {
      return L.divIcon({
        className: "hospital-marker-icon",
        html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#2563eb;border:2px solid #dbeafe;box-shadow:0 0 0 2px rgba(37,99,235,0.22);"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
    } catch {
      return undefined;
    }
  }, []);

  const nearestIcon = useMemo(() => {
    try {
      return L.divIcon({
        className: "nearest-hospital-icon",
        html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#be123c;border:3px solid #ffe4e6;box-shadow:0 0 0 3px rgba(190,18,60,0.2);"></span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
    } catch {
      return undefined;
    }
  }, []);

  return (
    <>
      {hospitals.map((hospital) => {
        const isNearest = hospital.id === nearestHospitalId;

        const icon = isNearest ? nearestIcon : regularIcon;

        return (
          <Marker
            key={hospital.id}
            position={[hospital.lat, hospital.lng]}
            {...(icon ? { icon } : {})}
          >
            <Popup>
              <div className="min-w-36">
                <p className="font-semibold text-gray-900">
                  {hospital.name || "Unnamed Hospital"}
                </p>
                <p className="text-xs text-gray-600">
                  {typeof hospital.distanceKm === "number"
                    ? `${hospital.distanceKm.toFixed(2)} km away`
                    : "Distance unavailable"}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default memo(HospitalMarkers);
