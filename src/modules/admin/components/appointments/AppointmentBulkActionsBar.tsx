"use client";

import { Button } from "@/shared/ui/button";

type Props = {
  selectedCount: number;
  loading: boolean;
  onEscalate: () => void;
  onCancel: () => void;
  onMarkNoShow: () => void;
  onMarkRefundRequired: () => void;
  onClear: () => void;
};

export default function AppointmentBulkActionsBar({
  selectedCount,
  loading,
  onEscalate,
  onCancel,
  onMarkNoShow,
  onMarkRefundRequired,
  onClear,
}: Props) {
  if (!selectedCount) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-700">
          {selectedCount} appointment{selectedCount > 1 ? "s" : ""} selected
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onEscalate}
            disabled={loading}
          >
            Escalate selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel selected
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkNoShow}
            disabled={loading}
          >
            Mark no-show
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onMarkRefundRequired}
            disabled={loading}
          >
            Mark refund required
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            disabled={loading}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
