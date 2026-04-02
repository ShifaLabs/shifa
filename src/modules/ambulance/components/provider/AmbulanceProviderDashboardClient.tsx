"use client";

import { useEffect, useMemo, useState } from "react";
import { useAmbulanceLocationTracking } from "../../hooks/useAmbulanceLocationTracking";
import {
  ProviderBookingsCard,
  ProviderMapCard,
  ProviderSummaryCard,
} from "./provider.ui";

const ACTIVE_BOOKING_STATUSES = [
  "assigned",
  "provider_en_route",
  "arrived",
  "patient_onboard",
] as const;

type DashboardProfile = {
  provider?: {
    _id?: string;
    displayName?: string;
    approvalStatus?: string;
    moderation?: {
      state?: string;
      reason?: string | null;
    };
  };
  vehicles?: Array<{
    _id?: string;
    vehicleNumber?: string;
    vehicleType?: string;
  }>;
  availability?: {
    isOnline?: boolean;
    dispatchStatus?: string;
    lastLocationAt?: string | null;
  };
};

type BookingRow = {
  _id: string;
  bookingCode: string;
  pickup: {
    address: string;
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  destination?: {
    address?: string;
    location?: {
      type: "Point";
      coordinates: [number, number];
    };
  } | null;
  contact?: {
    name?: string;
    phone?: string;
  };
  status: string;
};

export default function AmbulanceProviderDashboardClient() {
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [uiError, setUiError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { position, error } = useAmbulanceLocationTracking({
    enabled: isOnline,
    bookingId: bookings.find((booking) =>
      ACTIVE_BOOKING_STATUSES.includes(booking.status as any),
    )?._id,
  });

  async function load() {
    setUiError("");
    const [profileRes, bookingsRes] = await Promise.all([
      fetch("/api/ambulance/providers/me"),
      fetch("/api/ambulance/bookings"),
    ]);

    const profileJson = await profileRes.json();
    const bookingsJson = await bookingsRes.json();

    if (!profileRes.ok) {
      setUiError(profileJson?.error || "Unable to load provider profile");
    }

    setProfile(profileJson.data);
    setBookings(bookingsJson.data || []);
    setIsOnline(Boolean(profileJson.data?.availability?.isOnline));
    setLastSyncedAt(new Date());
    setLoading(false);
  }

  useEffect(() => {
    void load();
    const poll = setInterval(() => {
      void load();
    }, 12000);

    return () => clearInterval(poll);
  }, []);

  async function toggleAvailability(nextValue: boolean) {
    setUiError("");
    setActionLoading(true);
    const vehicleId = profile?.vehicles?.[0]?._id || null;
    const res = await fetch("/api/ambulance/providers/me/availability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOnline: nextValue, vehicleId }),
    });

    if (!res.ok) {
      const json = await res.json();
      setUiError(json?.error || "Could not update availability right now");
      setActionLoading(false);
      return;
    }

    setIsOnline(nextValue);
    await load();
    setActionLoading(false);
  }

  async function respond(bookingId: string, action: "accept" | "reject") {
    setUiError("");
    setActionLoading(true);

    const res = await fetch(`/api/ambulance/bookings/${bookingId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const json = await res.json();
      setUiError(json?.error || "Could not update booking response");
      setActionLoading(false);
      return;
    }

    await load();
    setActionLoading(false);
  }

  async function progressBooking(bookingId: string, status: string) {
    setActionLoading(true);
    setUiError("");

    const res = await fetch(`/api/ambulance/bookings/${bookingId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const json = await res.json();
      setUiError(json?.error || "Could not update booking status");
      setActionLoading(false);
      return;
    }

    await load();
    setActionLoading(false);
  }

  function nextStatusAction(status: string) {
    if (status === "assigned")
      return { label: "Start route", value: "provider_en_route" };
    if (status === "provider_en_route")
      return { label: "Mark arrived", value: "arrived" };
    if (status === "arrived")
      return { label: "Patient onboard", value: "patient_onboard" };
    if (status === "patient_onboard")
      return { label: "Complete trip", value: "completed" };
    return null;
  }

  const offeredCount = useMemo(
    () => bookings.filter((item) => item.status === "offered").length,
    [bookings],
  );

  const activeCount = useMemo(
    () =>
      bookings.filter((item) =>
        ACTIVE_BOOKING_STATUSES.includes(item.status as any),
      ).length,
    [bookings],
  );

  const completedCount = useMemo(
    () => bookings.filter((item) => item.status === "completed").length,
    [bookings],
  );

  const activeBooking = useMemo(
    () =>
      bookings.find((item) =>
        ACTIVE_BOOKING_STATUSES.includes(item.status as any),
      ) || null,
    [bookings],
  );

  const trackedTarget = useMemo(() => {
    const coords = activeBooking?.pickup?.location?.coordinates;
    if (!coords || coords.length !== 2) return null;

    return {
      lat: coords[1],
      lng: coords[0],
      providerName: `Pickup: ${activeBooking?.bookingCode || "Active booking"}`,
      updatedAt: null,
    };
  }, [activeBooking]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProviderSummaryCard
        profile={profile}
        lastSyncedAt={lastSyncedAt}
        isOnline={isOnline}
        actionLoading={actionLoading}
        activeCount={activeCount}
        offeredCount={offeredCount}
        completedCount={completedCount}
        onToggleAvailability={() => void toggleAvailability(!isOnline)}
        locationError={error}
        uiError={uiError}
      />

      <ProviderMapCard position={position} trackedTarget={trackedTarget} />

      <ProviderBookingsCard
        bookings={bookings}
        actionLoading={actionLoading}
        nextStatusAction={nextStatusAction}
        onRespond={(bookingId, action) => void respond(bookingId, action)}
        onProgress={(bookingId, status) =>
          void progressBooking(bookingId, status)
        }
      />
    </div>
  );
}
