"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  PatientAuditEntry,
  PatientRow,
} from "@/modules/admin/types/patient-admin.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  entries: PatientAuditEntry[];
  selectedPatient: PatientRow | null;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function PatientAuditDialog({
  open,
  onOpenChange,
  loading,
  entries,
  selectedPatient,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Patient Action History</DialogTitle>
          <DialogDescription>
            {selectedPatient?.fullName || "Patient"} lifecycle and moderation
            events.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-auto pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading
              history...
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No action history found for this patient.
            </p>
          ) : (
            entries.map((entry) => (
              <div key={entry._id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{entry.action}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  {entry.reason || "No reason provided"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Actor: {entry.actorId || "unknown"}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
