import { ObjectId } from "mongodb";
import { AMBULANCE_LOCATION_EVENT_TTL_DAYS } from "../domain/ambulance.constants";
import {
  providerApplicationSchema,
  providerAvailabilitySchema,
  providerLocationUpdateSchema,
  providerProfileUpdateSchema,
} from "./ambulance.schemas";
import { ambulanceRepository } from "../infrastructure/ambulance.repository";
import { publishRealtimeEvent } from "../infrastructure/ambulance.realtime";
import { createHttpError } from "../application/ambulance.shared";
import {
  isProviderApprovedForDispatch,
  isVehicleDispatchReady,
} from "./ambulance.search";
import type { AmbulanceProvider } from "../domain/ambulance.types";

function assertProviderCanDispatch(
  provider: Pick<AmbulanceProvider, "approvalStatus" | "moderation">,
) {
  if (!isProviderApprovedForDispatch(provider)) {
    throw createHttpError(
      "Provider is not active for dispatch. Please complete admin approval and keep provider status online.",
      403,
    );
  }
}

export async function applyAsAmbulanceProvider(
  userId: string,
  rawData: unknown,
) {
  const parsed = providerApplicationSchema.parse(rawData);
  const existing = await ambulanceRepository.findProviderByUserId(userId);

  if (existing) {
    throw createHttpError("Ambulance provider profile already exists", 409);
  }

  const now = new Date();
  const providerResult = await ambulanceRepository.createProvider({
    userId: new ObjectId(userId),
    displayName: parsed.displayName,
    organizationType: parsed.organizationType,
    approvalStatus: "pending",
    verification: {
      isEmailVerified: true,
      isPhoneVerified: false,
      documentsVerified: false,
    },
    contact: parsed.contact,
    serviceArea: parsed.serviceArea,
    baseLocation: parsed.baseLocation,
    documents: parsed.documents,
    moderation: {
      state: "none",
      reason: null,
      updatedAt: null,
      updatedBy: null,
    },
    createdAt: now,
    updatedAt: now,
  });

  const vehicleResult = await ambulanceRepository.createVehicle({
    providerId: providerResult.insertedId,
    vehicleNumber: parsed.vehicle.vehicleNumber,
    vehicleType: parsed.vehicle.vehicleType,
    capabilities: parsed.vehicle.capabilities,
    driver: parsed.vehicle.driver,
    status: "active",
    equipment: parsed.vehicle.equipment,
    createdAt: now,
    updatedAt: now,
  });

  await ambulanceRepository.upsertAvailability(providerResult.insertedId, {
    vehicleId: vehicleResult.insertedId,
    isOnline: false,
    dispatchStatus: "offline",
    currentLocation: parsed.baseLocation,
    lastLocationAt: null,
    heading: null,
    speedKph: null,
    accuracyMeters: null,
    heartbeatAt: null,
  });

  return getMyAmbulanceProviderProfile(userId);
}

export async function getMyAmbulanceProviderProfile(userId: string) {
  const provider = await ambulanceRepository.findProviderByUserId(userId);
  if (!provider) {
    throw createHttpError("Ambulance provider profile not found", 404);
  }

  const [vehicles, availability] = await Promise.all([
    ambulanceRepository.findVehiclesByProviderId(provider._id!),
    ambulanceRepository.findAvailabilityByProviderId(provider._id!),
  ]);

  return { provider, vehicles, availability };
}

export async function updateMyAmbulanceProviderProfile(
  userId: string,
  rawData: unknown,
) {
  const parsed = providerProfileUpdateSchema.parse(rawData);
  const current = await getMyAmbulanceProviderProfile(userId);

  await ambulanceRepository.updateProvider(current.provider._id!, parsed);
  return getMyAmbulanceProviderProfile(userId);
}

export async function updateAmbulanceAvailability(
  userId: string,
  rawData: unknown,
) {
  const parsed = providerAvailabilitySchema.parse(rawData);
  const current = await getMyAmbulanceProviderProfile(userId);

  assertProviderCanDispatch(current.provider);

  const vehicle = parsed.vehicleId
    ? current.vehicles.find((item) => item._id?.toString() === parsed.vehicleId)
    : current.vehicles[0] || null;

  if (!vehicle) {
    throw createHttpError(
      "An active vehicle is required before going online",
      400,
    );
  }

  if (!isVehicleDispatchReady(vehicle)) {
    throw createHttpError("Selected vehicle is not active for dispatch", 400);
  }

  const nextAvailability = await ambulanceRepository.upsertAvailability(
    current.provider._id!,
    {
      vehicleId: vehicle._id || null,
      isOnline: parsed.isOnline,
      dispatchStatus: parsed.isOnline
        ? parsed.dispatchStatus || "idle"
        : "offline",
      currentLocation: parsed.isOnline
        ? current.provider.baseLocation
        : current.availability?.currentLocation ||
          current.provider.baseLocation,
      lastLocationAt: parsed.isOnline
        ? null
        : current.availability?.lastLocationAt || null,
      heading: parsed.isOnline ? null : current.availability?.heading || null,
      speedKph: parsed.isOnline ? null : current.availability?.speedKph || null,
      accuracyMeters: parsed.isOnline
        ? null
        : current.availability?.accuracyMeters || null,
      heartbeatAt: parsed.isOnline
        ? null
        : current.availability?.heartbeatAt || null,
    },
  );

  await publishRealtimeEvent({
    channel: `ambulance-provider-${current.provider._id!.toString()}`,
    event: "availability.updated",
    data: {
      providerId: current.provider._id!.toString(),
      isOnline: nextAvailability?.isOnline ?? false,
      dispatchStatus: nextAvailability?.dispatchStatus || "offline",
    },
  });

  return nextAvailability;
}

export async function updateAmbulanceLiveLocation(
  userId: string,
  rawData: unknown,
) {
  const parsed = providerLocationUpdateSchema.parse(rawData);
  const current = await getMyAmbulanceProviderProfile(userId);

  assertProviderCanDispatch(current.provider);

  if (!current.availability?.isOnline) {
    throw createHttpError(
      "Provider must be online before sending location",
      400,
    );
  }

  const now = new Date();
  const bookingId = parsed.bookingId ? new ObjectId(parsed.bookingId) : null;
  const nextAvailability = await ambulanceRepository.upsertAvailability(
    current.provider._id!,
    {
      vehicleId: current.availability.vehicleId,
      currentLocation: parsed.currentLocation,
      lastLocationAt: now,
      heading: parsed.heading ?? null,
      speedKph: parsed.speedKph ?? null,
      accuracyMeters: parsed.accuracyMeters ?? null,
      heartbeatAt: now,
    },
  );

  await ambulanceRepository.insertLocationEvent({
    providerId: current.provider._id!,
    vehicleId: current.availability.vehicleId,
    bookingId,
    location: parsed.currentLocation,
    capturedAt: now,
    source: parsed.source,
    accuracyMeters: parsed.accuracyMeters ?? null,
    expiresAt: new Date(
      now.getTime() + AMBULANCE_LOCATION_EVENT_TTL_DAYS * 24 * 60 * 60 * 1000,
    ),
  });

  if (bookingId) {
    const booking = await ambulanceRepository.findBookingById(bookingId);
    if (booking) {
      await ambulanceRepository.updateBooking(bookingId, {
        tracking: {
          lastProviderLocation: parsed.currentLocation,
          lastLocationAt: now,
        },
      });
    }
  }

  await publishRealtimeEvent({
    channel: bookingId
      ? `ambulance-booking-${bookingId.toString()}`
      : `ambulance-provider-${current.provider._id!.toString()}`,
    event: "location.updated",
    data: {
      providerId: current.provider._id!.toString(),
      bookingId: bookingId?.toString() || null,
      location: parsed.currentLocation,
      heading: parsed.heading ?? null,
      speedKph: parsed.speedKph ?? null,
      accuracyMeters: parsed.accuracyMeters ?? null,
      recordedAt: now.toISOString(),
    },
  });

  return nextAvailability;
}
