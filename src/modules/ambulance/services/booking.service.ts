import { ObjectId } from "mongodb";
import {
  AMBULANCE_OFFER_TIMEOUT_MS,
  AMBULANCE_SEARCH_RADIUS_STEP_M,
} from "../domain/ambulance.constants";
import {
  ambulanceBookingActionSchema,
  ambulanceBookingCreateSchema,
  ambulanceBookingStatusUpdateSchema,
} from "./ambulance.schemas";
import { canTransitionBookingStatus } from "../domain/ambulance.state-machine";
import { ambulanceRepository } from "../infrastructure/ambulance.repository";
import { publishRealtimeEvent } from "../infrastructure/ambulance.realtime";
import { searchNearbyAmbulances } from "./search.service";
import { createHttpError } from "../application/ambulance.shared";
import { isProviderApprovedForDispatch } from "./ambulance.search";
import type { AmbulanceProvider } from "../domain/ambulance.types";

function assertProviderCanDispatch(
  provider: Pick<AmbulanceProvider, "approvalStatus" | "moderation">,
) {
  if (!isProviderApprovedForDispatch(provider)) {
    throw createHttpError("Provider is not active for dispatch", 403);
  }
}

function createBookingCode() {
  return `AMB-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function appendTimeline(
  timeline: Array<{
    type: string;
    at: Date;
    actorId: ObjectId | null;
    note?: string | null;
  }>,
  type: string,
  actorId: ObjectId | null,
  note?: string | null,
) {
  return [...timeline, { type, at: new Date(), actorId, note: note || null }];
}

async function offerNextCandidate(bookingId: ObjectId) {
  const booking = await ambulanceRepository.findBookingById(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }

  const nextCandidate = booking.candidateProviders.find(
    (candidate) => candidate.status === "queued",
  );

  if (!nextCandidate) {
    await ambulanceRepository.updateBooking(bookingId, {
      status: "expired",
      timeline: appendTimeline(
        booking.timeline,
        "booking.expired",
        null,
        "No providers accepted the request",
      ),
      dispatch: {
        ...booking.dispatch,
        offerExpiresAt: null,
      },
    });

    return ambulanceRepository.findBookingById(bookingId);
  }

  const now = new Date();
  const offerExpiresAt = new Date(now.getTime() + AMBULANCE_OFFER_TIMEOUT_MS);
  const candidateProviders = booking.candidateProviders.map((candidate) =>
    candidate.providerId.toString() === nextCandidate.providerId.toString()
      ? {
          ...candidate,
          status: "offered" as const,
          offeredAt: now,
          expiresAt: offerExpiresAt,
        }
      : candidate,
  );

  await ambulanceRepository.updateBooking(bookingId, {
    status: "offered",
    assignedProviderId: nextCandidate.providerId,
    assignedVehicleId: nextCandidate.vehicleId,
    candidateProviders,
    dispatch: {
      ...booking.dispatch,
      offerExpiresAt,
      reservedAt: now,
    },
    timeline: appendTimeline(
      booking.timeline,
      "booking.offered",
      nextCandidate.providerId,
    ),
  });

  await ambulanceRepository.upsertAvailability(nextCandidate.providerId, {
    vehicleId: nextCandidate.vehicleId,
    isOnline: true,
    dispatchStatus: "reserved",
  });

  await ambulanceRepository.insertDispatchEvent({
    bookingId,
    providerId: nextCandidate.providerId,
    vehicleId: nextCandidate.vehicleId,
    type: "offer.created",
    expiresAt: offerExpiresAt,
  });

  await publishRealtimeEvent({
    channel: `ambulance-provider-${nextCandidate.providerId.toString()}`,
    event: "dispatch.offer",
    data: {
      bookingId: bookingId.toString(),
      offerExpiresAt: offerExpiresAt.toISOString(),
    },
  });

  return ambulanceRepository.findBookingById(bookingId);
}

export async function processExpiredBookingOffer(bookingId: string | ObjectId) {
  const booking = await ambulanceRepository.findBookingById(bookingId);
  if (!booking || booking.status !== "offered") {
    return booking;
  }

  if (
    !booking.dispatch.offerExpiresAt ||
    booking.dispatch.offerExpiresAt > new Date()
  ) {
    return booking;
  }

  const candidates = booking.candidateProviders.map((candidate) =>
    candidate.status === "offered"
      ? {
          ...candidate,
          status: "expired" as const,
          respondedAt: new Date(),
        }
      : candidate,
  );

  await ambulanceRepository.updateBooking(booking._id!, {
    status: "searching",
    assignedProviderId: null,
    assignedVehicleId: null,
    candidateProviders: candidates,
    dispatch: {
      ...booking.dispatch,
      offerExpiresAt: null,
    },
    timeline: appendTimeline(
      booking.timeline,
      "booking.offer_expired",
      booking.assignedProviderId || null,
    ),
  });

  if (booking.assignedProviderId) {
    await ambulanceRepository.upsertAvailability(booking.assignedProviderId, {
      vehicleId: booking.assignedVehicleId,
      isOnline: true,
      dispatchStatus: "idle",
    });
  }

  return offerNextCandidate(booking._id!);
}

export async function createAmbulanceBooking(
  patientId: string,
  rawData: unknown,
) {
  const parsed = ambulanceBookingCreateSchema.parse(rawData);
  const nearby = await searchNearbyAmbulances({
    lat: parsed.pickup.location.coordinates[1],
    lng: parsed.pickup.location.coordinates[0],
    vehicleType: parsed.medicalContext.requestedVehicleType,
    limit: 5,
  });

  if (nearby.ambulances.length === 0) {
    throw createHttpError("No nearby ambulances are currently available", 404);
  }

  const selectedProviderId = parsed.selectedProviderId?.trim() || null;
  const selectedVehicleId = parsed.selectedVehicleId?.trim() || null;
  const selectedCandidate =
    selectedProviderId && selectedVehicleId
      ? nearby.ambulances.find(
          (candidate) =>
            String(candidate.providerId) === selectedProviderId &&
            String(candidate.vehicleId) === selectedVehicleId,
        )
      : null;

  const candidatesOrdered = selectedCandidate
    ? [
        selectedCandidate,
        ...nearby.ambulances.filter(
          (candidate) =>
            !(
              String(candidate.providerId) === selectedProviderId &&
              String(candidate.vehicleId) === selectedVehicleId
            ),
        ),
      ]
    : nearby.ambulances;

  const now = new Date();
  const result = await ambulanceRepository.createBooking({
    bookingCode: createBookingCode(),
    patientId: new ObjectId(patientId),
    status: "searching",
    pickup: parsed.pickup,
    destination: parsed.destination || null,
    contact: parsed.contact,
    medicalContext: parsed.medicalContext,
    candidateProviders: candidatesOrdered.map((candidate, index) => ({
      providerId: new ObjectId(String(candidate.providerId)),
      vehicleId: new ObjectId(String(candidate.vehicleId)),
      distanceMeters: Number(candidate.distanceMeters),
      rank: index + 1,
      status: "queued",
      offeredAt: null,
      respondedAt: null,
      expiresAt: null,
    })),
    assignedProviderId: null,
    assignedVehicleId: null,
    dispatch: {
      searchRadiusMeters: nearby.radiusMeters,
      offerExpiresAt: null,
      reservedAt: null,
      assignedAt: null,
    },
    tracking: {
      lastProviderLocation: null,
      lastLocationAt: null,
    },
    timeline: [
      {
        type: "booking.requested",
        at: now,
        actorId: new ObjectId(patientId),
      },
    ],
    createdAt: now,
    updatedAt: now,
  });

  const booking = await offerNextCandidate(result.insertedId);

  await publishRealtimeEvent({
    channel: `ambulance-booking-${result.insertedId.toString()}`,
    event: "booking.created",
    data: { bookingId: result.insertedId.toString() },
  });

  return booking;
}

export async function getAmbulanceBookingById(bookingId: string) {
  const booking = await processExpiredBookingOffer(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }
  return booking;
}

export async function getAmbulanceBookingTrackingForUser(
  bookingId: string,
  actorUserId: string,
  actorRole: string,
) {
  const booking = await getAmbulanceBookingById(bookingId);

  if (actorRole === "patient" && booking.patientId.toString() !== actorUserId) {
    throw createHttpError("Forbidden", 403);
  }

  if (actorRole === "ambulance_provider") {
    const provider =
      await ambulanceRepository.findProviderByUserId(actorUserId);
    if (
      !provider ||
      booking.assignedProviderId?.toString() !== provider._id?.toString()
    ) {
      throw createHttpError("Forbidden", 403);
    }
  }

  return {
    bookingId: booking._id?.toString() || bookingId,
    bookingCode: booking.bookingCode,
    status: booking.status,
    assignedProviderId: booking.assignedProviderId?.toString() || null,
    assignedVehicleId: booking.assignedVehicleId?.toString() || null,
    tracking: booking.tracking,
    updatedAt: booking.updatedAt,
  };
}

export async function listAmbulanceBookingsForUser(
  userId: string,
  role: string,
) {
  if (role === "patient") {
    return ambulanceRepository.findBookings({
      patientId: new ObjectId(userId),
    });
  }

  if (role === "ambulance_provider") {
    const provider = await ambulanceRepository.findProviderByUserId(userId);
    if (!provider) return [];
    return ambulanceRepository.findBookings({
      assignedProviderId: provider._id!,
    });
  }

  return ambulanceRepository.findBookings({});
}

export async function acceptAmbulanceBooking(
  bookingId: string,
  providerUserId: string,
  rawData: unknown,
) {
  const parsed = ambulanceBookingActionSchema.parse(rawData);
  const provider =
    await ambulanceRepository.findProviderByUserId(providerUserId);
  if (!provider) {
    throw createHttpError("Provider profile not found", 404);
  }
  assertProviderCanDispatch(provider);

  const booking = await processExpiredBookingOffer(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }

  if (
    booking.status !== "offered" ||
    booking.assignedProviderId?.toString() !== provider._id!.toString()
  ) {
    throw createHttpError("This booking is no longer assigned to you", 409);
  }

  const now = new Date();
  const candidateProviders = booking.candidateProviders.map((candidate) =>
    candidate.providerId.toString() === provider._id!.toString()
      ? { ...candidate, status: "accepted" as const, respondedAt: now }
      : candidate.status === "queued"
        ? { ...candidate, status: "skipped" as const }
        : candidate,
  );

  const updated = await ambulanceRepository.updateBooking(booking._id!, {
    status: "assigned",
    candidateProviders,
    dispatch: {
      ...booking.dispatch,
      assignedAt: now,
      offerExpiresAt: null,
    },
    timeline: appendTimeline(
      booking.timeline,
      "booking.accepted",
      provider._id!,
      parsed.note,
    ),
  });

  await ambulanceRepository.upsertAvailability(provider._id!, {
    vehicleId: booking.assignedVehicleId,
    isOnline: true,
    dispatchStatus: "en_route",
  });

  return updated;
}

export async function rejectAmbulanceBooking(
  bookingId: string,
  providerUserId: string,
  rawData: unknown,
) {
  const parsed = ambulanceBookingActionSchema.parse(rawData);
  const provider =
    await ambulanceRepository.findProviderByUserId(providerUserId);
  if (!provider) {
    throw createHttpError("Provider profile not found", 404);
  }
  assertProviderCanDispatch(provider);

  const booking = await processExpiredBookingOffer(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }

  if (
    booking.status !== "offered" ||
    booking.assignedProviderId?.toString() !== provider._id!.toString()
  ) {
    throw createHttpError("This booking is no longer assigned to you", 409);
  }

  const candidateProviders = booking.candidateProviders.map((candidate) =>
    candidate.providerId.toString() === provider._id!.toString()
      ? { ...candidate, status: "rejected" as const, respondedAt: new Date() }
      : candidate,
  );

  await ambulanceRepository.updateBooking(booking._id!, {
    status: "searching",
    assignedProviderId: null,
    assignedVehicleId: null,
    candidateProviders,
    dispatch: {
      ...booking.dispatch,
      offerExpiresAt: null,
      searchRadiusMeters:
        booking.dispatch.searchRadiusMeters + AMBULANCE_SEARCH_RADIUS_STEP_M,
    },
    timeline: appendTimeline(
      booking.timeline,
      "booking.rejected",
      provider._id!,
      parsed.note,
    ),
  });

  await ambulanceRepository.upsertAvailability(provider._id!, {
    vehicleId: booking.assignedVehicleId,
    isOnline: true,
    dispatchStatus: "idle",
  });

  return offerNextCandidate(booking._id!);
}

export async function cancelAmbulanceBooking(
  bookingId: string,
  actorUserId: string,
  actorRole: string,
  rawData: unknown,
) {
  const parsed = ambulanceBookingActionSchema.parse(rawData);
  const booking = await ambulanceRepository.findBookingById(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }

  const isOwner =
    actorRole === "patient" && booking.patientId.toString() === actorUserId;
  if (!isOwner && actorRole !== "admin") {
    throw createHttpError("You cannot cancel this booking", 403);
  }

  const updated = await ambulanceRepository.updateBooking(booking._id!, {
    status: "cancelled",
    timeline: appendTimeline(
      booking.timeline,
      "booking.cancelled",
      new ObjectId(actorUserId),
      parsed.note,
    ),
    dispatch: {
      ...booking.dispatch,
      offerExpiresAt: null,
    },
  });

  if (booking.assignedProviderId) {
    await ambulanceRepository.upsertAvailability(booking.assignedProviderId, {
      vehicleId: booking.assignedVehicleId,
      isOnline: true,
      dispatchStatus: "idle",
    });
  }

  return updated;
}

export async function updateAmbulanceBookingStatus(
  bookingId: string,
  actorUserId: string,
  actorRole: string,
  rawData: unknown,
) {
  const parsed = ambulanceBookingStatusUpdateSchema.parse(rawData);
  const booking = await ambulanceRepository.findBookingById(bookingId);
  if (!booking) {
    throw createHttpError("Booking not found", 404);
  }

  if (!["admin", "ambulance_provider"].includes(actorRole)) {
    throw createHttpError("Forbidden", 403);
  }

  if (!canTransitionBookingStatus(booking.status, parsed.status)) {
    throw createHttpError(
      `Cannot transition booking from ${booking.status} to ${parsed.status}`,
      409,
    );
  }

  if (actorRole === "ambulance_provider") {
    const provider =
      await ambulanceRepository.findProviderByUserId(actorUserId);
    if (!provider) {
      throw createHttpError("Provider profile not found", 404);
    }
    assertProviderCanDispatch(provider);
  }

  const updated = await ambulanceRepository.updateBooking(booking._id!, {
    status: parsed.status,
    timeline: appendTimeline(
      booking.timeline,
      `booking.${parsed.status}`,
      new ObjectId(actorUserId),
      parsed.note,
    ),
  });

  if (booking.assignedProviderId) {
    const dispatchStatus =
      parsed.status === "provider_en_route"
        ? "en_route"
        : parsed.status === "arrived"
          ? "at_pickup"
          : parsed.status === "patient_onboard"
            ? "on_trip"
            : parsed.status === "completed" || parsed.status === "cancelled"
              ? "idle"
              : undefined;

    if (dispatchStatus) {
      await ambulanceRepository.upsertAvailability(booking.assignedProviderId, {
        vehicleId: booking.assignedVehicleId,
        isOnline: true,
        dispatchStatus,
      });
    }
  }

  await publishRealtimeEvent({
    channel: `ambulance-booking-${booking._id!.toString()}`,
    event: "booking.status_changed",
    data: {
      bookingId: booking._id!.toString(),
      status: parsed.status,
    },
  });

  return updated;
}
