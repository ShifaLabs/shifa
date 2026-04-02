"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { NearbyAmbulance } from "../../hooks/useNearbyAmbulances";

const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];
const DEFAULT_ZOOM = 12;

function createUserMarkerIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background: #0f172a;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22s8-4.5 8-11a8 8 0 1 0-16 0c0 6.5 8 11 8 11z"></path>
          <circle cx="12" cy="11" r="2.8"></circle>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

function createAmbulanceMarkerIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px;
        background: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M10 10H6"></path>
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"></path>
          <path d="M8 8v4"></path>
          <path d="M9 18h6"></path>
          <circle cx="17" cy="18" r="2"></circle>
          <circle cx="7" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

const liveAmbulanceMarkerIcon = createAmbulanceMarkerIcon("#16a34a");
const baseAmbulanceMarkerIcon = createAmbulanceMarkerIcon("#0284c7");
const trackedAmbulanceMarkerIcon = createAmbulanceMarkerIcon("#f59e0b");
const userMarkerIcon = createUserMarkerIcon();

const MapContainerAny: any = MapContainer;
const TileLayerAny: any = TileLayer;
const MarkerAny: any = Marker;

export default function AmbulanceMapView({
  position,
  radiusMeters,
  ambulances,
  trackedAmbulance,
}: {
  position: { lat: number; lng: number } | null;
  radiusMeters: number;
  ambulances: NearbyAmbulance[];
  trackedAmbulance?: {
    lat: number;
    lng: number;
    providerName?: string;
    updatedAt?: string | null;
  } | null;
}) {
  const center: [number, number] = position
    ? [position.lat, position.lng]
    : DEFAULT_CENTER;

  return (
    <div className="h-105 w-full overflow-hidden rounded-2xl border bg-white shadow-sm md:h-130">
      <MapContainerAny
        center={center}
        zoom={position ? DEFAULT_ZOOM : 10}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayerAny
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {position ? (
          <MarkerAny
            position={[position.lat, position.lng]}
            icon={userMarkerIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Your location</p>
                <p>Search radius: {(radiusMeters / 1000).toFixed(0)} km</p>
              </div>
            </Popup>
          </MarkerAny>
        ) : null}

        {ambulances.map((item) => {
          const [lng, lat] = item.location.coordinates;
          return (
            <MarkerAny
              key={item.vehicleId}
              position={[lat, lng]}
              icon={
                item.locationSource === "live"
                  ? liveAmbulanceMarkerIcon
                  : baseAmbulanceMarkerIcon
              }
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{item.providerName}</p>
                  <p>
                    {item.vehicleType.toUpperCase()} | {item.vehicleNumber}
                  </p>
                  <p>{Math.round(item.distanceMeters)}m away</p>
                  <p>
                    {item.locationSource === "live"
                      ? "Live GPS"
                      : "Base location"}
                  </p>
                </div>
              </Popup>
            </MarkerAny>
          );
        })}

        {trackedAmbulance ? (
          <MarkerAny
            position={[trackedAmbulance.lat, trackedAmbulance.lng]}
            icon={trackedAmbulanceMarkerIcon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {trackedAmbulance.providerName || "Assigned ambulance"}
                </p>
                <p>Live trip tracking</p>
                {trackedAmbulance.updatedAt ? (
                  <p className="text-xs text-slate-500">
                    Updated:{" "}
                    {new Date(trackedAmbulance.updatedAt).toLocaleTimeString()}
                  </p>
                ) : null}
              </div>
            </Popup>
          </MarkerAny>
        ) : null}
      </MapContainerAny>
    </div>
  );
}
