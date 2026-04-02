"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/shared/ui/badge";
import AmbulanceMapView from "../provider/AmbulanceMapView";
import {
  useNearbyAmbulances,
  type NearbyAmbulance,
} from "../../hooks/useNearbyAmbulances";
import {
  PatientActiveBookingAlert,
  PatientBookingForm,
  PatientBookingHistory,
  PatientNearbyAmbulanceList,
  PatientSearchAlert,
  PatientSearchFilters,
  PatientSummaryCard,
} from "./patient.ui";

const RADIUS_OPTIONS = [1, 2, 5, 10, 15] as const;
const DEFAULT_RADIUS_KM = 10;

const initialForm = {
  pickupAddress: "",
  pickupLat: "",
  pickupLng: "",
  destinationAddress: "",
  destinationLat: "",
  destinationLng: "",
  contactName: "",
  contactPhone: "",
  requestedVehicleType: "basic",
  notes: "",
};

type LocationStatus = "idle" | "locating" | "granted" | "denied" | "error";

type BookingItem = {
  _id: string;
  bookingCode: string;
  pickup: {
    address: string;
  };
  status: string;
  assignedProviderId?: string | null;
  assignedVehicleId?: string | null;
  tracking?: {
    lastProviderLocation?: {
      type: "Point";
      coordinates: [number, number];
    } | null;
    lastLocationAt?: string | null;
  };
};

type BookingTrackingPayload = {
  bookingId: string;
  bookingCode: string;
  status: string;
  assignedProviderId: string | null;
  assignedVehicleId: string | null;
  tracking?: {
    lastProviderLocation?: {
      type: "Point";
      coordinates: [number, number];
    } | null;
    lastLocationAt?: string | null;
  };
};

function validateBookingPayload(form: typeof initialForm) {
  const pickupAddress = form.pickupAddress.trim();
  const contactName = form.contactName.trim();
  const contactPhone = form.contactPhone.trim();

  if (pickupAddress.length < 5) {
    return "Pickup address must be at least 5 characters.";
  }

  if (contactName.length < 2) {
    return "Contact name must be at least 2 characters.";
  }

  if (contactPhone.length < 5) {
    return "Contact phone must be at least 5 characters.";
  }

  return null;
}

export default function PatientAmbulanceBookingClient() {
  const [form, setForm] = useState(initialForm);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [searchError, setSearchError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [quickBookingVehicleId, setQuickBookingVehicleId] = useState("");
  const [tracking, setTracking] = useState<BookingTrackingPayload | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedRadiusKm, setSelectedRadiusKm] =
    useState<number>(DEFAULT_RADIUS_KM);
  const [searchVehicleType, setSearchVehicleType] = useState<
    "all" | "basic" | "icu"
  >("all");
  const {
    ambulances,
    loading: searchLoading,
    error: nearbyError,
    fetchNearbyAmbulances,
  } = useNearbyAmbulances();

  async function loadBookings() {
    const res = await fetch("/api/ambulance/bookings");
    const json = await res.json();
    const rows = json.data || [];
    setBookings(rows);
    setLastSyncedAt(new Date());
    return rows as BookingItem[];
  }

  useEffect(() => {
    void loadBookings();
    const bookingPoll = setInterval(() => {
      void loadBookings();
    }, 15000);

    return () => clearInterval(bookingPoll);
  }, []);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (!res.ok) return "";
      const json = await res.json();
      return json.address || "";
    } catch {
      return "";
    }
  }

  async function searchNearby(lat?: number, lng?: number) {
    const resolvedLat = lat ?? Number(form.pickupLat);
    const resolvedLng = lng ?? Number(form.pickupLng);

    if (!Number.isFinite(resolvedLat) || !Number.isFinite(resolvedLng)) {
      setSearchError("Please provide a valid pickup location first.");
      return;
    }

    setSearchError("");
    const filteredResults =
      (await fetchNearbyAmbulances({
        position: { lat: resolvedLat, lng: resolvedLng },
        radiusMeters: selectedRadiusKm * 1000,
        vehicleType: searchVehicleType === "all" ? null : searchVehicleType,
      })) || [];

    if (filteredResults.length === 0 && searchVehicleType !== "all") {
      setSearchError(
        `No ${searchVehicleType.toUpperCase()} ambulances found nearby. Switched to all vehicle types.`,
      );
      setSearchVehicleType("all");
      await fetchNearbyAmbulances({
        position: { lat: resolvedLat, lng: resolvedLng },
        radiusMeters: selectedRadiusKm * 1000,
        vehicleType: null,
      });
    }
  }

  async function findNearbyAmbulances() {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setSearchError("Geolocation is not supported on this device.");
      return;
    }

    setLocationStatus("locating");
    setSearchError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = await reverseGeocode(lat, lng);

        setCurrentPosition({ lat, lng });
        setLocationStatus("granted");
        setForm((prev) => ({
          ...prev,
          pickupLat: String(lat),
          pickupLng: String(lng),
          pickupAddress: address || prev.pickupAddress,
        }));

        await searchNearby(lat, lng);
      },
      () => {
        setLocationStatus("denied");
        setSearchError(
          "Location permission was denied. You can still enter pickup details manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      },
    );
  }

  useEffect(() => {
    if (locationStatus === "granted" && currentPosition) {
      void searchNearby(currentPosition.lat, currentPosition.lng);
    }
  }, [selectedRadiusKm, searchVehicleType, currentPosition, locationStatus]);

  async function submitBooking(selectedAmbulance?: NearbyAmbulance) {
    setBookingError("");

    const payloadError = validateBookingPayload(form);
    if (payloadError) {
      setBookingError(payloadError);
      return;
    }

    const pickupLat = Number(form.pickupLat);
    const pickupLng = Number(form.pickupLng);
    if (!Number.isFinite(pickupLat) || !Number.isFinite(pickupLng)) {
      setBookingError(
        "Please add a valid pickup latitude and longitude before booking.",
      );
      return;
    }

    setLoading(true);
    if (selectedAmbulance) {
      setQuickBookingVehicleId(selectedAmbulance.vehicleId);
    }
    const res = await fetch("/api/ambulance/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup: {
          address: form.pickupAddress,
          location: {
            type: "Point",
            coordinates: [pickupLng, pickupLat],
          },
        },
        destination: form.destinationAddress
          ? {
              address: form.destinationAddress,
              location: {
                type: "Point",
                coordinates: [
                  Number(form.destinationLng || pickupLng),
                  Number(form.destinationLat || pickupLat),
                ],
              },
            }
          : null,
        contact: {
          name: form.contactName,
          phone: form.contactPhone,
        },
        medicalContext: {
          notes: form.notes,
          requestedVehicleType:
            selectedAmbulance?.vehicleType || form.requestedVehicleType,
          requiresOxygen: false,
          requiresStretcher: true,
        },
        selectedProviderId: selectedAmbulance?.providerId || null,
        selectedVehicleId: selectedAmbulance?.vehicleId || null,
      }),
    });
    const json = await res.json();

    setLoading(false);
    setQuickBookingVehicleId("");

    if (!res.ok) {
      const validationHint = Array.isArray(json?.details)
        ? json.details
            .map((item: { field?: string; message?: string }) => {
              const field = item?.field ? `${item.field}: ` : "";
              return `${field}${item?.message || "Invalid value"}`;
            })
            .join(" | ")
        : "";

      setBookingError(
        validationHint ||
          json?.error ||
          "Could not place booking right now. Please try again.",
      );
      return;
    }

    await loadBookings();

    if (json?.data?._id) {
      setTracking({
        bookingId: String(json.data._id),
        bookingCode: String(json.data.bookingCode || ""),
        status: String(json.data.status || ""),
        assignedProviderId: json.data.assignedProviderId || null,
        assignedVehicleId: json.data.assignedVehicleId || null,
        tracking: json.data.tracking,
      });
    }
  }

  async function quickBookAmbulance(item: NearbyAmbulance) {
    await submitBooking(item);
  }

  const activeBooking = bookings.find((item) =>
    [
      "offered",
      "assigned",
      "provider_en_route",
      "arrived",
      "patient_onboard",
    ].includes(item.status),
  );

  const mergedSearchError = searchError || nearbyError;

  useEffect(() => {
    if (!activeBooking?._id) {
      setTracking(null);
      return;
    }

    let cancelled = false;

    const fetchTracking = async () => {
      try {
        const res = await fetch(
          `/api/ambulance/bookings/${activeBooking._id}/tracking`,
        );
        const json = await res.json();

        if (!cancelled && res.ok && json?.data) {
          setTracking(json.data);
        }
      } catch {
        // Keep last known tracking state on transient polling errors.
      }
    };

    void fetchTracking();
    const intervalId = setInterval(() => {
      void fetchTracking();
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeBooking?._id]);

  const trackedCoordinates =
    tracking?.tracking?.lastProviderLocation?.coordinates;
  const trackedAmbulance = trackedCoordinates
    ? {
        lat: trackedCoordinates[1],
        lng: trackedCoordinates[0],
        providerName: "Assigned ambulance",
        updatedAt: tracking?.tracking?.lastLocationAt || null,
      }
    : null;

  const bookingFormReady =
    form.pickupAddress.trim().length >= 5 &&
    form.contactName.trim().length >= 2 &&
    form.contactPhone.trim().length >= 5 &&
    Number.isFinite(Number(form.pickupLat)) &&
    Number.isFinite(Number(form.pickupLng));

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const activeCount = bookings.filter((booking) =>
    [
      "offered",
      "assigned",
      "provider_en_route",
      "arrived",
      "patient_onboard",
    ].includes(booking.status),
  ).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <PatientSummaryCard
          activeCount={activeCount}
          completedCount={completedCount}
          lastSyncedAt={lastSyncedAt}
          locationStatus={locationStatus}
          onFindNearby={() => void findNearbyAmbulances()}
        />
        <PatientSearchFilters
          radiusOptions={RADIUS_OPTIONS}
          selectedRadiusKm={selectedRadiusKm}
          onRadiusChange={setSelectedRadiusKm}
          searchVehicleType={searchVehicleType}
          onVehicleTypeChange={setSearchVehicleType}
          currentPosition={currentPosition}
          pickupAddress={form.pickupAddress}
        />
        <PatientSearchAlert message={mergedSearchError} />
        <PatientActiveBookingAlert
          activeBooking={activeBooking || null}
          tracking={tracking}
        />{" "}
        <section className="rounded-2xl border bg-white p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Live ambulance map</h2>
            <Badge variant="outline">{ambulances.length} found</Badge>
          </div>
          <AmbulanceMapView
            position={currentPosition}
            radiusMeters={selectedRadiusKm * 1000}
            ambulances={ambulances}
            trackedAmbulance={trackedAmbulance}
          />
        </section>
      </div>

      <div className="space-y-6 grid-cols-1">
        <PatientNearbyAmbulanceList
          ambulances={ambulances}
          searchLoading={searchLoading}
          loading={loading}
          quickBookingVehicleId={quickBookingVehicleId}
          activeBooking={activeBooking || null}
          bookingFormReady={bookingFormReady}
          onQuickBook={(item) => void quickBookAmbulance(item)}
        />{" "}
        <PatientBookingForm
          form={form}
          bookingError={bookingError}
          loading={loading}
          bookingFormReady={bookingFormReady}
          onChange={(key, value) =>
            setForm((previous) => ({ ...previous, [key]: value }))
          }
          onVehicleTypeChange={(event) =>
            setForm((previous) => ({
              ...previous,
              requestedVehicleType: event.target.value,
            }))
          }
          onNotesChange={(event) =>
            setForm((previous) => ({ ...previous, notes: event.target.value }))
          }
          onSearch={() => void searchNearby()}
          onBook={() => void submitBooking()}
        />
        <PatientBookingHistory bookings={bookings} />
      </div>
    </div>
  );
}
