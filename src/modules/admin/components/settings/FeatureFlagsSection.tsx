"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  FeatureFlagKey,
  UpdateFeatureFlagsPayload,
} from "@/modules/admin/types/settings-admin.types";

type Props = {
  loading: boolean;
  saving: boolean;
  featureFlags: Record<FeatureFlagKey, boolean>;
  onSave: (payload: UpdateFeatureFlagsPayload) => Promise<void>;
};

const LABELS: Record<FeatureFlagKey, string> = {
  enableDoctorSelfOnboarding: "Doctor Self Onboarding",
  enableRealtimeChat: "Realtime Chat",
  enableVideoConsultation: "Video Consultation",
  enableSmartTriage: "Smart Triage Assistant",
};

export default function FeatureFlagsSection({
  loading,
  saving,
  featureFlags,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(featureFlags);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setDraft(featureFlags);
  }, [featureFlags]);

  const dirtyCount = useMemo(
    () =>
      (Object.keys(draft) as FeatureFlagKey[]).filter(
        (key) => draft[key] !== featureFlags[key],
      ).length,
    [draft, featureFlags],
  );

  const hasChanges = dirtyCount > 0;

  const handleToggle = (key: FeatureFlagKey) => {
    setDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleReset = () => {
    setDraft(featureFlags);
    setReason("");
  };

  const handleSave = async () => {
    const changedFlags = (Object.keys(draft) as FeatureFlagKey[]).reduce(
      (acc, key) => {
        if (draft[key] !== featureFlags[key]) {
          acc[key] = draft[key];
        }
        return acc;
      },
      {} as Partial<Record<FeatureFlagKey, boolean>>,
    );

    if (Object.keys(changedFlags).length === 0) {
      return;
    }

    await onSave({
      flags: changedFlags,
      reason: reason.trim() || undefined,
    });

    setReason("");
  };

  return (
    <Card className=" p-4 md:p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Feature Flag Control
          <Badge variant="outline">{dirtyCount} pending</Badge>
        </CardTitle>
        <CardDescription>
          Toggle releases in a controlled way. Apply only changed flags to keep
          updates fast and audit-friendly.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(draft) as FeatureFlagKey[]).map((key) => {
            const enabled = draft[key];
            return (
              <div
                key={key}
                className="rounded-xl border bg-background px-4 py-3 shadow-xs"
              >
                <p className="text-sm font-medium">{LABELS[key]}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Runtime state: {enabled ? "Enabled" : "Disabled"}
                </p>

                <Button
                  type="button"
                  size="sm"
                  variant={enabled ? "default" : "outline"}
                  className="mt-3"
                  onClick={() => handleToggle(key)}
                  disabled={loading || saving}
                >
                  {enabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature-flags-reason">Change reason (optional)</Label>
          <Input
            id="feature-flags-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why are these flag changes needed?"
            disabled={loading || saving}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || loading || saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Feature Flags
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || loading || saving}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
