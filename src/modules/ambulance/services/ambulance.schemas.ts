import { z } from "zod";
import {
  AMBULANCE_BOOKING_STATUSES,
  AMBULANCE_DISPATCH_STATUSES,
  AMBULANCE_PROVIDER_APPROVAL_STATUSES,
  AMBULANCE_VEHICLE_TYPES,
} from "../domain/ambulance.constants";

const coordinateSchema = z.custom<[number, number]>((value) => {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }

  const [lng, lat] = value;
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}, "Coordinates must be [lng, lat]");

export const geoPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: coordinateSchema,
});

export const providerApplicationSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  organizationType: z.enum(["hospital", "private", "individual"]),
  contact: z.object({
    phone: z.string().trim().min(5).max(25),
    email: z.string().trim().email(),
    address: z.string().trim().min(5).max(200),
  }),
  serviceArea: z.array(z.string().trim().min(2).max(80)).min(1).max(10),
  baseLocation: geoPointSchema,
  documents: z
    .object({
      tradeLicenseNumber: z.string().trim().max(80).optional().nullable(),
      nationalId: z.string().trim().max(80).optional().nullable(),
      vehicleRegistration: z.string().trim().max(80).optional().nullable(),
    })
    .default({}),
  vehicle: z.object({
    vehicleNumber: z.string().trim().min(2).max(40),
    vehicleType: z.enum(AMBULANCE_VEHICLE_TYPES),
    capabilities: z.array(z.string().trim().min(2).max(50)).default([]),
    driver: z.object({
      name: z.string().trim().min(2).max(80),
      phone: z.string().trim().min(5).max(25),
      licenseNumber: z.string().trim().max(80).optional().nullable(),
    }),
    equipment: z.array(z.string().trim().min(2).max(50)).default([]),
  }),
});

export const providerProfileUpdateSchema = providerApplicationSchema.omit({
  vehicle: true,
});

export const providerAvailabilitySchema = z.object({
  isOnline: z.boolean(),
  vehicleId: z.string().trim().optional().nullable(),
  dispatchStatus: z.enum(AMBULANCE_DISPATCH_STATUSES).optional(),
});

export const providerLocationUpdateSchema = z.object({
  currentLocation: geoPointSchema,
  heading: z.number().min(0).max(360).optional().nullable(),
  speedKph: z.number().min(0).max(250).optional().nullable(),
  accuracyMeters: z.number().min(0).max(5000).optional().nullable(),
  bookingId: z.string().trim().optional().nullable(),
  source: z.enum(["device", "manual"]).default("device"),
});

export const ambulanceSearchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(1000).max(15000).default(10000),
  vehicleType: z.enum(AMBULANCE_VEHICLE_TYPES).optional(),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export const ambulanceBookingCreateSchema = z.object({
  pickup: z.object({
    address: z.string().trim().min(5).max(200),
    location: geoPointSchema,
  }),
  destination: z
    .object({
      address: z.string().trim().min(5).max(200),
      location: geoPointSchema,
    })
    .optional()
    .nullable(),
  contact: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(5).max(25),
  }),
  medicalContext: z.object({
    notes: z.string().trim().max(500).optional(),
    requestedVehicleType: z.enum(AMBULANCE_VEHICLE_TYPES),
    requiresOxygen: z.boolean().default(false),
    requiresStretcher: z.boolean().default(true),
  }),
  selectedProviderId: z.string().trim().optional().nullable(),
  selectedVehicleId: z.string().trim().optional().nullable(),
});

export const ambulanceBookingActionSchema = z.object({
  note: z.string().trim().max(240).optional(),
});

export const ambulanceBookingStatusUpdateSchema = z.object({
  status: z.enum(AMBULANCE_BOOKING_STATUSES),
  note: z.string().trim().max(240).optional(),
});

export const ambulanceProviderModerationSchema = z.object({
  action: z.enum(AMBULANCE_PROVIDER_APPROVAL_STATUSES),
  reason: z.string().trim().max(240).optional(),
});
