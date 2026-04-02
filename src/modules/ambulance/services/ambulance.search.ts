import {
  AmbulanceAvailability,
  AmbulanceProvider,
  AmbulanceVehicle,
  GeoPoint,
} from "../domain/ambulance.types";
import { AMBULANCE_STALE_LOCATION_MS } from "../domain/ambulance.constants";

type SearchCandidateInput = {
  provider: AmbulanceProvider | null | undefined;
  availability: AmbulanceAvailability | null | undefined;
  vehicle: AmbulanceVehicle | null | undefined;
  query: {
    lat: number;
    lng: number;
    radius: number;
    vehicleType?: string;
  };
};

function isLocationFresh(lastLocationAt: Date | null | undefined) {
  if (!lastLocationAt) return false;
  return (
    Date.now() - new Date(lastLocationAt).getTime() <=
    AMBULANCE_STALE_LOCATION_MS
  );
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371e3;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function isProviderApprovedForDispatch(
  provider:
    | Pick<AmbulanceProvider, "approvalStatus" | "moderation">
    | null
    | undefined,
) {
  return (
    Boolean(provider) &&
    provider!.approvalStatus === "approved" &&
    provider!.moderation.state !== "suspended"
  );
}

export function isVehicleDispatchReady(
  vehicle: AmbulanceVehicle | null | undefined,
) {
  return Boolean(vehicle && vehicle.status === "active");
}

export function isAvailabilityDispatchReady(
  availability: AmbulanceAvailability | null | undefined,
) {
  return Boolean(
    availability &&
    availability.isOnline &&
    availability.dispatchStatus === "idle" &&
    availability.vehicleId,
  );
}

export function resolveDispatchLocation(
  provider: AmbulanceProvider,
  availability: AmbulanceAvailability | null | undefined,
) {
  const locationFresh =
    Boolean(availability?.currentLocation) &&
    isLocationFresh(availability?.lastLocationAt);

  if (locationFresh && availability?.currentLocation) {
    return {
      location: availability.currentLocation,
      locationSource: "live" as const,
      locationFresh: true,
    };
  }

  return {
    location: provider.baseLocation,
    locationSource: "base" as const,
    locationFresh: false,
  };
}

export function resolveSearchCandidate(input: SearchCandidateInput) {
  const { provider, availability, vehicle, query } = input;

  if (
    !provider ||
    !availability ||
    !vehicle ||
    !isProviderApprovedForDispatch(provider) ||
    !isAvailabilityDispatchReady(availability) ||
    !isVehicleDispatchReady(vehicle)
  ) {
    return null;
  }

  if (query.vehicleType && vehicle.vehicleType !== query.vehicleType) {
    return null;
  }

  const resolvedLocation = resolveDispatchLocation(provider, availability);
  const [lng, lat] = resolvedLocation.location.coordinates;
  const distanceMeters = Math.round(
    haversineMeters(query.lat, query.lng, lat, lng),
  );

  if (distanceMeters > query.radius) {
    return null;
  }

  return {
    providerId: provider._id!.toString(),
    providerName: provider.displayName,
    vehicleId: vehicle._id!.toString(),
    vehicleNumber: vehicle.vehicleNumber,
    vehicleType: vehicle.vehicleType,
    capabilities: vehicle.capabilities,
    dispatchStatus: availability.dispatchStatus,
    distanceMeters,
    location: resolvedLocation.location as GeoPoint,
    locationSource: resolvedLocation.locationSource,
    locationFresh: resolvedLocation.locationFresh,
    lastLocationAt: availability.lastLocationAt,
  };
}
