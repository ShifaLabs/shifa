"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Lock } from "lucide-react";
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
  AdminSettingsSnapshot,
  UpdateSecurityPrivacyPayload,
} from "@/modules/admin/types/settings-admin.types";

type Props = {
  loading: boolean;
  saving: boolean;
  policy: AdminSettingsSnapshot["securityPrivacy"];
  onSave: (payload: UpdateSecurityPrivacyPayload) => Promise<void>;
};

export default function SecurityPrivacySection({
  loading,
  saving,
  policy,
  onSave,
}: Props) {
  const [draft, setDraft] = useState(policy);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setDraft(policy);
  }, [policy]);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(policy),
    [draft, policy],
  );

  const handleSave = async () => {
    await onSave({
      ...draft,
      reason: reason.trim() || undefined,
    });
    setReason("");
  };

  return (
    <Card className=" p-4 md:p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Security and Privacy
        </CardTitle>
        <CardDescription>
          Tighten admin account controls and data governance defaults.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="space-y-2">
          <Label htmlFor="max-active-sessions">
            Max active sessions per admin
          </Label>
          <Input
            id="max-active-sessions"
            type="number"
            min={1}
            max={20}
            value={draft.maxActiveSessionsPerAdmin}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                maxActiveSessionsPerAdmin: Number(event.target.value || 1),
              }))
            }
            disabled={loading || saving}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retention-period-days">
            Data retention period (days)
          </Label>
          <Input
            id="retention-period-days"
            type="number"
            min={30}
            max={3650}
            value={draft.retentionPeriodDays}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                retentionPeriodDays: Number(event.target.value || 30),
              }))
            }
            disabled={loading || saving}
          />
        </div>

        <div className="space-y-2 rounded-xl border bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              id="strict-ip-check"
              type="checkbox"
              className="h-4 w-4"
              checked={draft.enforceStrictSessionIpCheck}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  enforceStrictSessionIpCheck: event.target.checked,
                }))
              }
              disabled={loading || saving}
            />
            <Label htmlFor="strict-ip-check" className="cursor-pointer">
              Enforce strict session IP verification
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="pii-export-approval"
              type="checkbox"
              className="h-4 w-4"
              checked={draft.piiExportApprovalRequired}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  piiExportApprovalRequired: event.target.checked,
                }))
              }
              disabled={loading || saving}
            />
            <Label htmlFor="pii-export-approval" className="cursor-pointer">
              Require approval for PII export tasks
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="security-policy-reason">
            Policy change reason (optional)
          </Label>
          <Input
            id="security-policy-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. audit hardening"
            disabled={loading || saving}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || loading || saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save Security Policy
          </Button>
          <Badge variant="outline">Compliance ready</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
