"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  ReportsActorType,
  ReportsModerationAction,
} from "@/modules/admin/types/reports-admin.types";

type Props = {
  open: boolean;
  loading?: boolean;
  actorType: ReportsActorType;
  actorName: string;
  action: ReportsModerationAction;
  reason: string;
  durationDays: string;
  onReasonChange: (value: string) => void;
  onDurationDaysChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

function actionTitle(action: ReportsModerationAction) {
  if (action === "ban") return "Ban account";
  if (action === "suspend") return "Suspend account";
  return "Reactivate account";
}

export default function ReportsModerationDialog({
  open,
  loading,
  actorType,
  actorName,
  action,
  reason,
  durationDays,
  onReasonChange,
  onDurationDaysChange,
  onClose,
  onConfirm,
}: Props) {
  const requiresReason = action !== "reactivate";
  const requiresDuration = action === "suspend";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{actionTitle(action)}</DialogTitle>
          <DialogDescription>
            You are updating a {actorType} account: <strong>{actorName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moderation-reason">
              Reason{requiresReason ? " *" : " (optional)"}
            </Label>
            <Textarea
              id="moderation-reason"
              rows={4}
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder={
                action === "reactivate"
                  ? "Optional reason for audit timeline"
                  : "Describe why this action is needed"
              }
            />
          </div>

          {requiresDuration ? (
            <div className="space-y-2">
              <Label htmlFor="moderation-duration">
                Suspension duration (days)
              </Label>
              <Input
                id="moderation-duration"
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(event) => onDurationDaysChange(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === "ban" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
