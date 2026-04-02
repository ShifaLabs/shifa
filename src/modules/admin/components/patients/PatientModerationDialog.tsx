"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  PatientModerationAction,
  PatientRow,
} from "@/modules/admin/types/patient-admin.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAction: PatientModerationAction;
  selectedPatient: PatientRow | null;
  selectedCount: number;
  reason: string;
  onReasonChange: (value: string) => void;
  durationDays: string;
  onDurationChange: (value: string) => void;
  loading: boolean;
  onConfirm: () => void;
};

export default function PatientModerationDialog({
  open,
  onOpenChange,
  currentAction,
  selectedPatient,
  selectedCount,
  reason,
  onReasonChange,
  durationDays,
  onDurationChange,
  loading,
  onConfirm,
}: Props) {
  const needsReason = currentAction === "suspend" || currentAction === "ban";
  const isSuspend = currentAction === "suspend";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="capitalize">
            {selectedPatient
              ? `${currentAction} ${selectedPatient.fullName || "patient"}`
              : `Bulk ${currentAction}`}
          </DialogTitle>
          <DialogDescription>
            {selectedPatient
              ? "This action updates patient moderation state and records an audit trail."
              : `This action updates ${selectedCount} selected patients.`}
          </DialogDescription>
        </DialogHeader>

        {needsReason ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Action reason</p>
            <Textarea
              value={reason}
              onChange={(event) => onReasonChange(event.target.value)}
              placeholder="Explain why this moderation action is needed"
              rows={4}
            />
          </div>
        ) : null}

        {isSuspend ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Suspension duration (days)</p>
            <Input
              type="number"
              min={1}
              max={365}
              value={durationDays}
              onChange={(event) => onDurationChange(event.target.value)}
            />
          </div>
        ) : null}

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4" />
            <p>
              Moderation actions are logged for compliance and incident review.
              Include clear context for risk actions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={currentAction === "ban" ? "destructive" : "default"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm {currentAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
