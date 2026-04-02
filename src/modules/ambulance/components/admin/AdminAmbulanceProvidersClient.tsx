"use client";

import { useEffect, useMemo, useState } from "react";
import type { NearbyAmbulance } from "../../hooks/useNearbyAmbulances";
import {
  AdminModerationQueueCard,
  AdminProviderMapCard,
  AdminSummaryCard,
  type AdminProviderView,
} from "./admin.ui";

type AdminProvider = AdminProviderView & {
  baseLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
};

export default function AdminAmbulanceProvidersClient() {
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [reasonByProvider, setReasonByProvider] = useState<
    Record<string, string>
  >({});
  const [loadingAction, setLoadingAction] = useState<string>("");
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "suspended"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMap, setShowMap] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/ambulance/providers");
    const json = await res.json();
    setProviders(json.data || []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function moderate(providerId: string, action: string) {
    setLoadingAction(`${providerId}:${action}`);
    setError("");

    const res = await fetch(
      `/api/admin/ambulance/providers/${providerId}/moderate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason: reasonByProvider[providerId] || undefined,
        }),
      },
    );

    if (!res.ok) {
      const json = await res.json();
      setError(json?.error || "Could not update provider moderation state.");
      setLoadingAction("");
      return;
    }

    await load();
    setLoadingAction("");
  }

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const statusMatch =
        statusFilter === "all" || provider.approvalStatus === statusFilter;
      const search = searchTerm.trim().toLowerCase();
      const searchMatch =
        !search ||
        (provider.displayName || "").toLowerCase().includes(search) ||
        (provider.contact?.phone || "").toLowerCase().includes(search);

      return statusMatch && searchMatch;
    });
  }, [providers, searchTerm, statusFilter]);

  const providerMapItems = useMemo<NearbyAmbulance[]>(() => {
    return filteredProviders
      .filter((provider) => provider.baseLocation?.coordinates)
      .map((provider) => ({
        providerId: provider._id,
        providerName: provider.displayName || "Ambulance provider",
        vehicleId: `admin-map-${provider._id}`,
        vehicleNumber: "N/A",
        vehicleType: "basic",
        capabilities: [],
        dispatchStatus: provider.approvalStatus || "pending",
        distanceMeters: 0,
        location: {
          type: "Point",
          coordinates: provider.baseLocation!.coordinates,
        },
        locationSource: "base",
        locationFresh: false,
        lastLocationAt: null,
      }));
  }, [filteredProviders]);

  const summary = useMemo(() => {
    const countBy = (status: string) =>
      providers.filter((provider) => provider.approvalStatus === status).length;
    return {
      pending: countBy("pending"),
      approved: countBy("approved"),
      suspended: countBy("suspended"),
      rejected: countBy("rejected"),
    };
  }, [providers]);

  return (
    <div className="space-y-6">
      <AdminSummaryCard
        summary={summary}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showMap={showMap}
        onToggleMap={() => setShowMap((value) => !value)}
        statusFilter={statusFilter}
        onFilterChange={setStatusFilter}
        error={error}
      />

      <AdminProviderMapCard
        showMap={showMap}
        providerMapItems={providerMapItems}
      />

      <AdminModerationQueueCard
        loading={loading}
        providers={filteredProviders}
        reasonByProvider={reasonByProvider}
        loadingAction={loadingAction}
        onReasonChange={(providerId, value) =>
          setReasonByProvider((previous) => ({
            ...previous,
            [providerId]: value,
          }))
        }
        onModerate={(providerId, action) => void moderate(providerId, action)}
      />
    </div>
  );
}
