import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import AmbulanceMapView from "../provider/AmbulanceMapView";
import type { NearbyAmbulance } from "../../hooks/useNearbyAmbulances";

export type AdminProviderView = {
  _id: string;
  displayName?: string;
  approvalStatus?: string;
  contact?: {
    phone?: string;
  };
  moderation?: {
    reason?: string | null;
  };
};

function approvalTone(status: string) {
  if (status === "approved") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-rose-50 text-rose-700";
  if (status === "suspended") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function AdminSummaryCard({
  summary,
  searchTerm,
  onSearchChange,
  showMap,
  onToggleMap,
  statusFilter,
  onFilterChange,
  error,
}: {
  summary: {
    pending: number;
    approved: number;
    suspended: number;
    rejected: number;
  };
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showMap: boolean;
  onToggleMap: () => void;
  statusFilter: "all" | "pending" | "approved" | "rejected" | "suspended";
  onFilterChange: (
    status: "all" | "pending" | "approved" | "rejected" | "suspended",
  ) => void;
  error: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Ambulance provider moderation
        </CardTitle>
        <p className="text-sm text-slate-600">
          Approving upgrades user role to ambulance_provider. Rejecting or
          suspending sets role back to patient and takes provider offline.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Pending
            </p>
            <p className="text-xl font-bold text-amber-700">
              {summary.pending}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Approved
            </p>
            <p className="text-xl font-bold text-emerald-700">
              {summary.approved}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Suspended
            </p>
            <p className="text-xl font-bold text-amber-800">
              {summary.suspended}
            </p>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Rejected
            </p>
            <p className="text-xl font-bold text-rose-700">
              {summary.rejected}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Search provider name or phone"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <Button variant="outline" onClick={onToggleMap}>
            {showMap ? "Hide map" : "Show map"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            ["all", "pending", "approved", "suspended", "rejected"] as const
          ).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => onFilterChange(status)}
            >
              {status}
            </Button>
          ))}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Moderation failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AdminProviderMapCard({
  showMap,
  providerMapItems,
}: {
  showMap: boolean;
  providerMapItems: NearbyAmbulance[];
}) {
  if (!showMap) return null;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Provider coverage map</CardTitle>
      </CardHeader>
      <CardContent>
        <AmbulanceMapView
          position={null}
          radiusMeters={1000}
          ambulances={providerMapItems}
        />
      </CardContent>
    </Card>
  );
}

export function AdminModerationQueueCard({
  loading,
  providers,
  reasonByProvider,
  loadingAction,
  onReasonChange,
  onModerate,
}: {
  loading: boolean;
  providers: AdminProviderView[];
  reasonByProvider: Record<string, string>;
  loadingAction: string;
  onReasonChange: (providerId: string, value: string) => void;
  onModerate: (providerId: string, action: string) => void;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Moderation queue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading providers...</p>
          ) : null}
          {providers.map((provider) => (
            <div key={provider._id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{provider.displayName}</p>
                  <p className="text-sm text-slate-600">
                    {provider.contact?.phone}
                  </p>
                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={approvalTone(
                        provider.approvalStatus || "pending",
                      )}
                    >
                      {provider.approvalStatus || "pending"}
                    </Badge>
                  </div>
                  {provider?.moderation?.reason ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Last note: {provider.moderation.reason}
                    </p>
                  ) : null}
                </div>
                <div className="w-full max-w-md space-y-3">
                  <Textarea
                    className="min-h-20"
                    placeholder="Moderation note (optional)"
                    value={reasonByProvider[provider._id] || ""}
                    onChange={(event) =>
                      onReasonChange(provider._id, event.target.value)
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={
                        Boolean(loadingAction) ||
                        provider.approvalStatus === "approved"
                      }
                      onClick={() => onModerate(provider._id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={
                        Boolean(loadingAction) ||
                        provider.approvalStatus === "suspended"
                      }
                      onClick={() => onModerate(provider._id, "suspended")}
                    >
                      Suspend
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={
                        Boolean(loadingAction) ||
                        provider.approvalStatus === "rejected"
                      }
                      onClick={() => onModerate(provider._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {providers.length === 0 ? (
            <p className="text-sm text-slate-500">No providers found.</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
