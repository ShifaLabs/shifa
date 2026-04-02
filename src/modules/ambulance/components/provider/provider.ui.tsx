import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import AmbulanceMapView from "./AmbulanceMapView";

type DashboardProfileView = {
  provider?: {
    displayName?: string;
    approvalStatus?: string;
    moderation?: {
      reason?: string | null;
    };
  };
  vehicles?: Array<{
    vehicleNumber?: string;
    vehicleType?: string;
  }>;
  availability?: {
    dispatchStatus?: string;
    lastLocationAt?: string | null;
  };
};

type BookingRowView = {
  _id: string;
  bookingCode: string;
  pickup: {
    address: string;
  };
  contact?: {
    name?: string;
    phone?: string;
  };
  status: string;
};

function statusTone(status: string) {
  if (["completed"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["cancelled", "expired", "rejected"].includes(status))
    return "bg-rose-50 text-rose-700";
  if (
    [
      "offered",
      "assigned",
      "provider_en_route",
      "arrived",
      "patient_onboard",
    ].includes(status)
  )
    return "bg-sky-50 text-sky-700";
  return "bg-slate-100 text-slate-700";
}

export function ProviderSummaryCard({
  profile,
  lastSyncedAt,
  isOnline,
  actionLoading,
  activeCount,
  offeredCount,
  completedCount,
  onToggleAvailability,
  locationError,
  uiError,
}: {
  profile: DashboardProfileView | null;
  lastSyncedAt: Date | null;
  isOnline: boolean;
  actionLoading: boolean;
  activeCount: number;
  offeredCount: number;
  completedCount: number;
  onToggleAvailability: () => void;
  locationError: string | null;
  uiError: string;
}) {
  return (
    <Card className="rounded-2xl border-zinc-200">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            {profile?.provider?.displayName || "Ambulance provider"}
          </CardTitle>
          <p className="text-sm text-slate-600">
            Approval: {profile?.provider?.approvalStatus || "pending"}
          </p>
          {lastSyncedAt ? (
            <p className="text-xs text-slate-500">
              Last synced at {lastSyncedAt.toLocaleTimeString()}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          className={
            isOnline
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-[#1F6F68] hover:bg-[#195a54]"
          }
          onClick={onToggleAvailability}
          disabled={actionLoading}
        >
          {isOnline ? "Go Offline" : "Go Online"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Vehicle
            </p>
            <p className="mt-1 text-sm font-semibold">
              {profile?.vehicles?.[0]?.vehicleNumber || "Not linked"}
            </p>
            <p className="text-xs text-slate-600">
              {(profile?.vehicles?.[0]?.vehicleType || "unknown").toUpperCase()}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Dispatch Status
            </p>
            <p className="mt-1 text-sm font-semibold capitalize">
              {(profile?.availability?.dispatchStatus || "offline").replace(
                /_/g,
                " ",
              )}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Active Trips
            </p>
            <p className="mt-1 text-xl font-bold text-[#1F6F68]">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Offers Waiting
            </p>
            <p className="mt-1 text-xl font-bold text-amber-700">
              {offeredCount}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={
              isOnline
                ? "border-emerald-300 text-emerald-700"
                : "border-zinc-300 text-zinc-700"
            }
          >
            {isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant="outline">Completed {completedCount}</Badge>
          <Badge variant="outline">
            {profile?.availability?.lastLocationAt
              ? `GPS heartbeat ${new Date(profile.availability.lastLocationAt).toLocaleTimeString()}`
              : "Waiting for first location update"}
          </Badge>
        </div>

        {profile?.provider?.moderation?.reason ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTitle>Moderation Note</AlertTitle>
            <AlertDescription>
              {profile.provider.moderation.reason}
            </AlertDescription>
          </Alert>
        ) : null}

        {locationError ? (
          <Alert variant="destructive">
            <AlertTitle>Location Error</AlertTitle>
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        ) : null}
        {uiError ? (
          <Alert variant="destructive">
            <AlertTitle>Action Failed</AlertTitle>
            <AlertDescription>{uiError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ProviderMapCard({
  position,
  trackedTarget,
}: {
  position: { lat: number; lng: number } | null;
  trackedTarget: {
    lat: number;
    lng: number;
    providerName?: string;
    updatedAt?: string | null;
  } | null;
}) {
  return (
    <Card className="rounded-2xl border-zinc-200">
      <CardHeader>
        <CardTitle className="text-lg">Dispatch Map</CardTitle>
      </CardHeader>
      <CardContent>
        <AmbulanceMapView
          position={position}
          radiusMeters={1000}
          ambulances={[]}
          trackedAmbulance={trackedTarget}
        />
      </CardContent>
    </Card>
  );
}

export function ProviderBookingsCard({
  bookings,
  actionLoading,
  nextStatusAction,
  onRespond,
  onProgress,
}: {
  bookings: BookingRowView[];
  actionLoading: boolean;
  nextStatusAction: (status: string) => { label: string; value: string } | null;
  onRespond: (bookingId: string, action: "accept" | "reject") => void;
  onProgress: (bookingId: string, status: string) => void;
}) {
  return (
    <Card className="rounded-2xl border-zinc-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Assigned and offered bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : null}
          {bookings.map((booking) => (
            <div key={booking._id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{booking.bookingCode}</p>
                  <p className="text-sm text-slate-600">
                    {booking.pickup.address}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Patient: {booking.contact?.name || "N/A"} |{" "}
                    {booking.contact?.phone || "N/A"}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${statusTone(booking.status)}`}
                  >
                    {booking.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.status === "offered" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => onRespond(booking._id, "accept")}
                        disabled={actionLoading}
                      >
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => onRespond(booking._id, "reject")}
                        disabled={actionLoading}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                  {nextStatusAction(booking.status) ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        onProgress(
                          booking._id,
                          nextStatusAction(booking.status)!.value,
                        )
                      }
                      disabled={actionLoading}
                    >
                      {nextStatusAction(booking.status)!.label}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
