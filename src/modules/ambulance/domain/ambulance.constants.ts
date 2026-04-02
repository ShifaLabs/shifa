export const AMBULANCE_PROVIDER_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;

export const AMBULANCE_DISPATCH_STATUSES = [
  "offline",
  "idle",
  "reserved",
  "en_route",
  "at_pickup",
  "on_trip",
  "unavailable",
] as const;

export const AMBULANCE_BOOKING_STATUSES = [
  "requested",
  "searching",
  "offered",
  "assigned",
  "provider_en_route",
  "arrived",
  "patient_onboard",
  "completed",
  "cancelled",
  "expired",
] as const;

export const AMBULANCE_VEHICLE_TYPES = ["basic", "icu"] as const;

export const AMBULANCE_OFFER_TIMEOUT_MS = 45_000;
export const AMBULANCE_INITIAL_SEARCH_RADIUS_M = 5_000;
export const AMBULANCE_MAX_SEARCH_RADIUS_M = 25_000;
export const AMBULANCE_SEARCH_RADIUS_STEP_M = 5_000;
export const AMBULANCE_STALE_LOCATION_MS = 90_000;
export const AMBULANCE_LOCATION_EVENT_TTL_DAYS = 7;
