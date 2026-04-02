import { type ChangeEvent } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { NearbyAmbulance } from "../../hooks/useNearbyAmbulances";

function bookingStatusTone(status: string) {
  if (["completed"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["cancelled", "expired"].includes(status))
    return "bg-rose-50 text-rose-700";
  if (
    [
      "offered",
      "assigned",
      "provider_en_route",
      "arrived",
      "patient_onboard",
    ].includes(status)
  ) {
    return "bg-sky-50 text-sky-700";
  }
  return "bg-slate-100 text-slate-700";
}

export type BookingItemView = {
  _id: string;
  bookingCode: string;
  pickup: {
    address: string;
  };
  status: string;
};

type BookingTrackingView = {
  tracking?: {
    lastProviderLocation?: {
      type: "Point";
      coordinates: [number, number];
    } | null;
    lastLocationAt?: string | null;
  };
};

type BookingFormState = {
  pickupAddress: string;
  pickupLat: string;
  pickupLng: string;
  destinationAddress: string;
  contactName: string;
  contactPhone: string;
  requestedVehicleType: string;
  notes: string;
};

export function PatientSummaryCard({
  activeCount,
  completedCount,
  lastSyncedAt,
  locationStatus,
  onFindNearby,
}: {
  activeCount: number;
  completedCount: number;
  lastSyncedAt: Date | null;
  locationStatus: "idle" | "locating" | "granted" | "denied" | "error";
  onFindNearby: () => void;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Nearby ambulance
        </CardTitle>
        <p className="text-sm text-slate-600 pb-4">
          Use your current location to find approved ambulances nearby. If a
          provider is online but has not started live GPS yet, we show their
          registered base location as an approximate area.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Active bookings
            </p>
            <p className="text-lg font-bold text-[#1F6F68]">{activeCount}</p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Completed
            </p>
            <p className="text-lg font-bold text-emerald-700">
              {completedCount}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Last sync
            </p>
            <p className="text-sm font-semibold text-slate-700">
              {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : "Waiting"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Search and dispatch
            </h2>
          </div>
          <Button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-white"
            onClick={onFindNearby}
            disabled={locationStatus === "locating"}
          >
            {locationStatus === "locating"
              ? "Finding location..."
              : "Nearby Ambulance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PatientSearchFilters({
  radiusOptions,
  selectedRadiusKm,
  onRadiusChange,
  searchVehicleType,
  onVehicleTypeChange,
  currentPosition,
  pickupAddress,
}: {
  radiusOptions: readonly number[];
  selectedRadiusKm: number;
  onRadiusChange: (value: number) => void;
  searchVehicleType: "all" | "basic" | "icu";
  onVehicleTypeChange: (value: "all" | "basic" | "icu") => void;
  currentPosition: { lat: number; lng: number } | null;
  pickupAddress: string;
}) {
  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
        {radiusOptions.map((radiusKm) => {
          const active = selectedRadiusKm === radiusKm;
          return (
            <button
              key={radiusKm}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-slate-700"
              }`}
              onClick={() => onRadiusChange(radiusKm)}
            >
              {radiusKm} km
            </button>
          );
        })}
      </div>

      <div className="mt-3 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {[
          { label: "All", value: "all" },
          { label: "Basic", value: "basic" },
          { label: "ICU", value: "icu" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              searchVehicleType === item.value
                ? "bg-slate-900 text-white"
                : "text-slate-600"
            }`}
            onClick={() =>
              onVehicleTypeChange(item.value as "all" | "basic" | "icu")
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p>
          Search radius:{" "}
          <span className="font-semibold">{selectedRadiusKm} km</span>
        </p>
        <p className="mt-1">
          Current location:{" "}
          {currentPosition
            ? `${currentPosition.lat.toFixed(5)}, ${currentPosition.lng.toFixed(5)}`
            : "Not detected yet"}
        </p>
        <p className="mt-1">
          Pickup address:{" "}
          {pickupAddress || "Use nearby ambulance or enter manually below"}
        </p>
      </div>
    </>
  );
}

export function PatientSearchAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <Alert variant="destructive">
      <AlertTitle>Search issue</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function PatientActiveBookingAlert({
  activeBooking,
  tracking,
}: {
  activeBooking: BookingItemView | null | undefined;
  tracking: BookingTrackingView | null;
}) {
  if (!activeBooking) return null;

  return (
    <Alert className="border-sky-200 bg-sky-50 text-sky-800">
      <AlertTitle>
        Active booking {activeBooking.bookingCode} is in progress
      </AlertTitle>
      <AlertDescription>
        {tracking?.tracking?.lastProviderLocation?.coordinates ? (
          <p className="mt-1 text-xs text-sky-700">
            Last ambulance location:{" "}
            {tracking.tracking.lastProviderLocation.coordinates[1].toFixed(5)},{" "}
            {tracking.tracking.lastProviderLocation.coordinates[0].toFixed(5)}
          </p>
        ) : null}
        {tracking?.tracking?.lastLocationAt ? (
          <p className="mt-1 text-xs text-sky-700">
            Last update:{" "}
            {new Date(tracking.tracking.lastLocationAt).toLocaleTimeString()}
          </p>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

export function PatientNearbyAmbulanceList({
  ambulances,
  searchLoading,
  loading,
  quickBookingVehicleId,
  activeBooking,
  bookingFormReady,
  onQuickBook,
}: {
  ambulances: NearbyAmbulance[];
  searchLoading: boolean;
  loading: boolean;
  quickBookingVehicleId: string;
  activeBooking: BookingItemView | null | undefined;
  bookingFormReady: boolean;
  onQuickBook: (item: NearbyAmbulance) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Ambulances around you</h2>
        {searchLoading ? (
          <span className="text-sm text-slate-500">Searching...</span>
        ) : null}
      </div>

      <div className="space-y-3">
        {!searchLoading && !ambulances.length ? (
          <p className="text-sm text-slate-500">
            No nearby ambulance results yet. Use the button above to search by
            your current location.
          </p>
        ) : null}
        {ambulances.map((item) => (
          <div key={item.vehicleId} className="rounded-xl border p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">{item.providerName}</p>
                <p className="text-sm text-slate-600">
                  {String(item.vehicleType).toUpperCase()} |{" "}
                  {item.distanceMeters}m away
                </p>
                <p className="text-xs text-slate-500">
                  Status: {item.dispatchStatus}
                </p>
                <p className="text-xs text-slate-500">
                  {item.locationSource === "live"
                    ? "Live GPS location"
                    : "Approximate location from registered base"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    loading ||
                    quickBookingVehicleId === item.vehicleId ||
                    Boolean(activeBooking) ||
                    !bookingFormReady
                  }
                  onClick={() => onQuickBook(item)}
                >
                  {quickBookingVehicleId === item.vehicleId
                    ? "Booking..."
                    : "Book now"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PatientBookingForm({
  form,
  bookingError,
  loading,
  bookingFormReady,
  onChange,
  onVehicleTypeChange,
  onNotesChange,
  onSearch,
  onBook,
}: {
  form: BookingFormState;
  bookingError: string;
  loading: boolean;
  bookingFormReady: boolean;
  onChange: (key: keyof BookingFormState, value: string) => void;
  onVehicleTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onNotesChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onSearch: () => void;
  onBook: () => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">Booking details</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Pickup address"
          value={form.pickupAddress}
          onChange={(event) => onChange("pickupAddress", event.target.value)}
        />
        <Input
          placeholder="Pickup latitude"
          value={form.pickupLat}
          onChange={(event) => onChange("pickupLat", event.target.value)}
        />
        <Input
          placeholder="Pickup longitude"
          value={form.pickupLng}
          onChange={(event) => onChange("pickupLng", event.target.value)}
        />
        <Input
          placeholder="Contact name"
          value={form.contactName}
          onChange={(event) => onChange("contactName", event.target.value)}
        />
        <Input
          placeholder="Contact phone"
          value={form.contactPhone}
          onChange={(event) => onChange("contactPhone", event.target.value)}
        />
        <select
          className="rounded-lg border p-3"
          value={form.requestedVehicleType}
          onChange={onVehicleTypeChange}
        >
          <option value="basic">Basic</option>
          <option value="icu">ICU</option>
        </select>
        <Input
          className="md:col-span-2"
          placeholder="Destination address"
          value={form.destinationAddress}
          onChange={(event) =>
            onChange("destinationAddress", event.target.value)
          }
        />
      </div>
      <Textarea
        className="min-h-28 w-full"
        placeholder="Emergency notes"
        value={form.notes}
        onChange={onNotesChange}
      />
      {bookingError ? (
        <p className="text-sm text-rose-600">{bookingError}</p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onSearch}>
          Search with current form
        </Button>
        <Button
          type="button"
          onClick={onBook}
          disabled={loading || !bookingFormReady}
        >
          {loading ? "Booking..." : "Book ambulance"}
        </Button>
      </div>
    </section>
  );
}

export function PatientBookingHistory({
  bookings,
}: {
  bookings: BookingItemView[];
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          My ambulance bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No ambulance bookings yet.</p>
          ) : null}
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl border p-4">
              <p className="font-semibold">{booking.bookingCode}</p>
              <p className="text-sm text-slate-600">{booking.pickup.address}</p>
              <p className="mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize">
                <span
                  className={`rounded-full px-2 py-1 ${bookingStatusTone(booking.status)}`}
                >
                  {booking.status.replace(/_/g, " ")}
                </span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
