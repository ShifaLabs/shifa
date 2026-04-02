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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  AdminSettingsSnapshot,
  UpdateModerationPolicyPayload,
} from "@/modules/admin/types/settings-admin.types";

type Props = {
  loading: boolean;
  saving: boolean;
  policy: AdminSettingsSnapshot["moderationPolicy"];
  onSave: (payload: UpdateModerationPolicyPayload) => Promise<void>;
};

export default function ModerationPolicySection({
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

  const defaultExceedsMax =
    draft.defaultSuspendDurationDays > draft.maxSuspendDurationDays;

  const handleSave = async () => {
    if (defaultExceedsMax) {
      return;
    }

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
          Moderation Policy
          <Badge variant="outline">Policy only</Badge>
        </CardTitle>
        <CardDescription>
          Define safe defaults for suspension and ban governance. Execution
          actions remain in user moderation workflows.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="default-suspend-duration">
              Default suspension duration (days)
            </Label>
            <Input
              id="default-suspend-duration"
              type="number"
              min={1}
              max={365}
              value={draft.defaultSuspendDurationDays}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  defaultSuspendDurationDays: Number(event.target.value || 0),
                }))
              }
              disabled={loading || saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-suspend-duration">
              Maximum suspension duration (days)
            </Label>
            <Input
              id="max-suspend-duration"
              type="number"
              min={1}
              max={365}
              value={draft.maxSuspendDurationDays}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  maxSuspendDurationDays: Number(event.target.value || 0),
                }))
              }
              disabled={loading || saving}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Auto-expire mode</Label>
            <Select
              value={draft.autoExpireMode}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  autoExpireMode:
                    value as UpdateModerationPolicyPayload["autoExpireMode"],
                }))
              }
              disabled={loading || saving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select auto-expire mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="warn_only">Warn only</SelectItem>
                <SelectItem value="auto_release">Auto release</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-muted/20 px-4 py-3">
          <input
            id="require-ban-reason"
            type="checkbox"
            className="h-4 w-4"
            checked={draft.requireReasonForBan}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                requireReasonForBan: event.target.checked,
              }))
            }
            disabled={loading || saving}
          />
          <Label htmlFor="require-ban-reason" className="cursor-pointer">
            Require a reason when banning users
          </Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="moderation-policy-reason">
            Policy change reason (optional)
          </Label>
          <Input
            id="moderation-policy-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. tighter compliance requirement"
            disabled={loading || saving}
          />
        </div>

        {defaultExceedsMax ? (
          <p className="text-sm text-destructive">
            Default suspension duration cannot exceed maximum suspension
            duration.
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || defaultExceedsMax || loading || saving}
          className="gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Moderation Policy
        </Button>
      </CardContent>
    </Card>
  );
}
