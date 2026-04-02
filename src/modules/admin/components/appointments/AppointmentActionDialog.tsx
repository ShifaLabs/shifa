"use client";

import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
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
  AppointmentAction,
  AppointmentRow,
} from "@/modules/admin/types/appointment-admin.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAction: AppointmentAction;
  selectedAppointment: AppointmentRow | null;
  selectedCount: number;
  reason: string;
  onReasonChange: (value: string) => void;
  loading: boolean;
  onConfirm: () => void;
};

const actionLabelMap: Record<AppointmentAction, string> = {
  escalate: "Escalate",
  cancel: "Cancel",
  markNoShow: "Mark No-Show",
  markRefundRequired: "Mark Refund Required",
};

export default function AppointmentActionDialog({
  open,
  onOpenChange,
  currentAction,
  selectedAppointment,
  selectedCount,
  reason,
  onReasonChange,
  loading,
  onConfirm,
}: Props) {
  const actionLabel = actionLabelMap[currentAction];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedAppointment
              ? `${actionLabel} ${selectedAppointment.appointmentId || "appointment"}`
              : `Bulk ${actionLabel}`}
          </DialogTitle>
          <DialogDescription>
            {selectedAppointment
              ? "This action updates appointment state and logs a full audit entry."
              : `This action updates ${selectedCount} selected appointments.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-medium">Action reason</p>
          <Textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Explain why this action is required"
            rows={4}
          />
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4" />
            <p>
              Intervention actions are compliance-sensitive and visible in audit
              history. Add enough context for downstream reviews.
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
            variant={currentAction === "cancel" ? "destructive" : "default"}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
