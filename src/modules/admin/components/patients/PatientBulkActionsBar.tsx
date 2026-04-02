"use client";

import { Button } from "@/shared/ui/button";

type Props = {
  selectedCount: number;
  loading: boolean;
  onSuspend: () => void;
  onBan: () => void;
  onReactivate: () => void;
  onClear: () => void;
};

export default function PatientBulkActionsBar({
  selectedCount,
  loading,
  onSuspend,
  onBan,
  onReactivate,
  onClear,
}: Props) {
  if (!selectedCount) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-700">
          {selectedCount} patient{selectedCount > 1 ? "s" : ""} selected
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSuspend}
            disabled={loading}
          >
            Suspend selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onBan}
            disabled={loading}
          >
            Ban selected
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onReactivate}
            disabled={loading}
          >
            Reactivate selected
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
