"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import FeatureFlagsSection from "./FeatureFlagsSection";
import ModerationPolicySection from "./ModerationPolicySection";
import SecurityPrivacySection from "./SecurityPrivacySection";
import IntegrationsHealthSection from "./IntegrationsHealthSection";
import {
  getAdminSettingsSnapshotAction,
  updateFeatureFlagsAction,
  updateModerationPolicyAction,
  updateSecurityPrivacyAction,
} from "@/modules/admin/services/settings-admin.action";
import {
  AdminSettingsSnapshot,
  IntegrationHealthResponse,
  UpdateFeatureFlagsPayload,
  UpdateModerationPolicyPayload,
  UpdateSecurityPrivacyPayload,
} from "@/modules/admin/types/settings-admin.types";

const initialSnapshot: AdminSettingsSnapshot = {
  version: 1,
  featureFlags: {
    enableDoctorSelfOnboarding: false,
    enableRealtimeChat: false,
    enableVideoConsultation: false,
    enableSmartTriage: false,
  },
  moderationPolicy: {
    requireReasonForBan: true,
    defaultSuspendDurationDays: 14,
    maxSuspendDurationDays: 90,
    autoExpireMode: "warn_only",
  },
  securityPrivacy: {
    maxActiveSessionsPerAdmin: 3,
    enforceStrictSessionIpCheck: false,
    retentionPeriodDays: 365,
    piiExportApprovalRequired: true,
  },
  updatedAt: null,
  updatedBy: null,
};

async function fetchIntegrationsHealth(): Promise<{
  success: boolean;
  message: string;
  data?: IntegrationHealthResponse;
}> {
  const response = await fetch("/api/admin/settings/integrations-health", {
    method: "GET",
    cache: "no-store",
  });
  return response.json();
}

export default function AdminSettingsPageShell() {
  const [snapshot, setSnapshot] =
    useState<AdminSettingsSnapshot>(initialSnapshot);
  const [health, setHealth] = useState<IntegrationHealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState({
    featureFlags: false,
    moderationPolicy: false,
    securityPrivacy: false,
  });

  const loadSettingsWorkspace = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsResult, healthResult] = await Promise.all([
        getAdminSettingsSnapshotAction(),
        fetchIntegrationsHealth(),
      ]);

      if (settingsResult.success && settingsResult.data) {
        setSnapshot(settingsResult.data);
      } else {
        toast.error(settingsResult.message || "Failed to load settings");
      }

      if (healthResult.success && healthResult.data) {
        setHealth(healthResult.data);
      } else if (!healthResult.success) {
        toast.error(
          healthResult.message || "Failed to load integration health",
        );
      }
    } catch (error) {
      console.error("Failed to load settings workspace:", error);
      toast.error("Failed to load settings workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettingsWorkspace();
  }, [loadSettingsWorkspace]);

  const versionLabel = useMemo(
    () => `v${snapshot.version}`,
    [snapshot.version],
  );

  const handleSaveFeatureFlags = async (payload: UpdateFeatureFlagsPayload) => {
    try {
      setSaveState((prev) => ({ ...prev, featureFlags: true }));

      const optimistic = {
        ...snapshot,
        featureFlags: {
          ...snapshot.featureFlags,
          ...payload.flags,
        },
      };
      setSnapshot(optimistic);

      const result = await updateFeatureFlagsAction(payload);
      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to update feature flags");
        await loadSettingsWorkspace();
        return;
      }

      setSnapshot(result.data);
      toast.success(result.message || "Feature flags updated");
    } catch (error) {
      console.error("Failed to save feature flags:", error);
      toast.error("Failed to update feature flags");
      await loadSettingsWorkspace();
    } finally {
      setSaveState((prev) => ({ ...prev, featureFlags: false }));
    }
  };

  const handleSaveModerationPolicy = async (
    payload: UpdateModerationPolicyPayload,
  ) => {
    try {
      setSaveState((prev) => ({ ...prev, moderationPolicy: true }));

      setSnapshot((prev) => ({
        ...prev,
        moderationPolicy: {
          requireReasonForBan: payload.requireReasonForBan,
          defaultSuspendDurationDays: payload.defaultSuspendDurationDays,
          maxSuspendDurationDays: payload.maxSuspendDurationDays,
          autoExpireMode: payload.autoExpireMode,
        },
      }));

      const result = await updateModerationPolicyAction(payload);
      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to update moderation policy");
        await loadSettingsWorkspace();
        return;
      }

      setSnapshot(result.data);
      toast.success(result.message || "Moderation policy updated");
    } catch (error) {
      console.error("Failed to save moderation policy:", error);
      toast.error("Failed to update moderation policy");
      await loadSettingsWorkspace();
    } finally {
      setSaveState((prev) => ({ ...prev, moderationPolicy: false }));
    }
  };

  const handleSaveSecurityPrivacy = async (
    payload: UpdateSecurityPrivacyPayload,
  ) => {
    try {
      setSaveState((prev) => ({ ...prev, securityPrivacy: true }));

      setSnapshot((prev) => ({
        ...prev,
        securityPrivacy: {
          maxActiveSessionsPerAdmin: payload.maxActiveSessionsPerAdmin,
          enforceStrictSessionIpCheck: payload.enforceStrictSessionIpCheck,
          retentionPeriodDays: payload.retentionPeriodDays,
          piiExportApprovalRequired: payload.piiExportApprovalRequired,
        },
      }));

      const result = await updateSecurityPrivacyAction(payload);
      if (!result.success || !result.data) {
        toast.error(result.message || "Failed to update security and privacy");
        await loadSettingsWorkspace();
        return;
      }

      setSnapshot(result.data);
      toast.success(result.message || "Security and privacy policy updated");
    } catch (error) {
      console.error("Failed to save security and privacy policy:", error);
      toast.error("Failed to update security and privacy");
      await loadSettingsWorkspace();
    } finally {
      setSaveState((prev) => ({ ...prev, securityPrivacy: false }));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Toaster richColors position="top-right" />

      <div className="rounded-2xl border bg-linear-to-r from-primary/8 via-background to-secondary/25 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Admin System Settings
              </h1>
              <Badge variant="outline">{versionLabel}</Badge>
            </div>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
              High-control policy center for feature rollout, moderation
              guardrails, security posture, and integration readiness.
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={loadSettingsWorkspace}
            disabled={loading}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Refresh Workspace
          </Button>
        </div>
      </div>

      <Alert>
        <AlertTitle>Moderation Actions Location</AlertTitle>
        <AlertDescription>
          Ban, suspend, and reactivate actions remain in dedicated operators
          workflows. Use these quick links for user-level interventions:{" "}
          <Link
            href="/dashboard/admin/doctors"
            className="font-medium underline"
          >
            Doctors
          </Link>{" "}
          and{" "}
          <Link
            href="/dashboard/admin/patients"
            className="font-medium underline"
          >
            Patients
          </Link>
          .
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <FeatureFlagsSection
            loading={loading}
            saving={saveState.featureFlags}
            featureFlags={snapshot.featureFlags}
            onSave={handleSaveFeatureFlags}
          />

          <ModerationPolicySection
            loading={loading}
            saving={saveState.moderationPolicy}
            policy={snapshot.moderationPolicy}
            onSave={handleSaveModerationPolicy}
          />
        </div>

        <div className="space-y-6">
          <SecurityPrivacySection
            loading={loading}
            saving={saveState.securityPrivacy}
            policy={snapshot.securityPrivacy}
            onSave={handleSaveSecurityPrivacy}
          />

          <IntegrationsHealthSection
            loading={loading}
            health={health}
            onRefresh={loadSettingsWorkspace}
          />
        </div>
      </div>
    </div>
  );
}
