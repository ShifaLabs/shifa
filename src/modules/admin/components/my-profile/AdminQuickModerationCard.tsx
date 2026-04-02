"use client";

import { useState } from "react";
import { AlertTriangle, ShieldBan, UserCog } from "lucide-react";
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
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  AdminQuickModerationAction,
  AdminQuickModerationActor,
  AdminQuickModerationPayload,
} from "@/modules/admin/types/profile-admin.types";

type Props = {
  loading: boolean;
  onSubmit: (payload: AdminQuickModerationPayload) => Promise<void>;
};

export default function AdminQuickModerationCard({ loading, onSubmit }: Props) {
  const [actorType, setActorType] =
    useState<AdminQuickModerationActor>("patient");
  const [targetEmail, setTargetEmail] = useState("");
  const [action, setAction] = useState<AdminQuickModerationAction>("suspend");
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      actorType,
      targetEmail: targetEmail.trim(),
      action,
      reason: reason.trim(),
      durationDays:
        action === "suspend" ? Number(durationDays || 0) : undefined,
    });
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5 p-4 md:p-6">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <ShieldBan className="size-4" />
          Quick Moderation Controls
        </CardTitle>
        <CardDescription>
          Execute urgent suspend, ban, or reactivate operations directly from
          your profile workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Actor Type</Label>
              <Select
                value={actorType}
                onValueChange={(value) =>
                  setActorType(value as AdminQuickModerationActor)
                }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Action</Label>
              <Select
                value={action}
                onValueChange={(value) =>
                  setAction(value as AdminQuickModerationAction)
                }
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suspend">Suspend</SelectItem>
                  <SelectItem value="ban">Ban</SelectItem>
                  <SelectItem value="reactivate">Reactivate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quickModerationEmail">Target email</Label>
            <Input
              id="quickModerationEmail"
              value={targetEmail}
              onChange={(event) => setTargetEmail(event.target.value)}
              placeholder="user@example.com"
              className="bg-background"
            />
          </div>

          {action === "suspend" ? (
            <div className="space-y-2">
              <Label htmlFor="quickModerationDuration">Duration (days)</Label>
              <Input
                id="quickModerationDuration"
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                className="bg-background"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="quickModerationReason">Reason</Label>
            <Textarea
              id="quickModerationReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Incident details and policy context"
              className="bg-background"
              rows={4}
            />
          </div>

          <div className="rounded-lg border border-destructive/30 bg-background p-3 text-sm text-muted-foreground">
            <p className="inline-flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 text-destructive" />
              All moderation actions are audited and can trigger downstream
              appointment impact flows.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            variant={action === "ban" ? "destructive" : "default"}
            disabled={loading || !targetEmail.trim()}
          >
            <UserCog className="size-4" />
            {loading ? "Applying..." : `Run ${action}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
