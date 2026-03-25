"use client";

import { Ellipsis, History } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  PatientModerationAction,
  PatientRow,
} from "@/modules/admin/types/patient-admin.types";
import PatientRiskBadge from "@/modules/admin/components/patients/PatientRiskBadge";

type Props = {
  loading: boolean;
  rows: PatientRow[];
  selectedIds: string[];
  allVisibleSelected: boolean;
  onToggleRow: (id: string) => void;
  onToggleAllVisible: () => void;
  onOpenAction: (action: PatientModerationAction, patient?: PatientRow) => void;
  onOpenAudit: (patient: PatientRow) => void;
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

function formatRelative(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Expired";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

export default function PatientsTable({
  loading,
  rows,
  selectedIds,
  allVisibleSelected,
  onToggleRow,
  onToggleAllVisible,
  onOpenAction,
  onOpenAudit,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full min-w-270 border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr className="text-zinc-500">
            <th className="px-4 py-2 text-left">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleAllVisible}
                aria-label="Select all visible patients"
              />
            </th>
            <th className="px-3 py-2 text-left">Patient</th>
            <th className="px-3 py-2 text-left">Activity</th>
            <th className="px-3 py-2 text-left">Lifecycle</th>
            <th className="px-3 py-2 text-left">Moderation</th>
            <th className="px-3 py-2 text-left">Risk</th>
            <th className="px-3 py-2 text-left">Last Login</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                Loading patients...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                No patients matched your filters.
              </td>
            </tr>
          ) : (
            rows.map((patient) => (
              <tr key={patient._id} className="align-top">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(patient._id)}
                    onChange={() => onToggleRow(patient._id)}
                    aria-label={`Select ${patient.fullName || "patient"}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {patient.fullName || "Unnamed patient"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {patient.email || "No email"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {patient.phone || "No phone"}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {patient.activity?.totalAppointments || 0} appointments
                    </p>
                    <p className="text-xs text-zinc-500">
                      Last appointment:{" "}
                      {formatDate(patient.activity?.lastAppointmentAt)}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <Badge
                      variant={
                        patient.status === "active" ? "default" : "secondary"
                      }
                    >
                      {patient.status || "unknown"}
                    </Badge>
                    <p className="text-xs text-zinc-500">
                      Joined {formatDate(patient.createdAt)}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <Badge
                      variant={
                        patient.moderation?.state === "banned"
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {patient.moderation?.state || "none"}
                    </Badge>
                    {patient.moderation?.state === "suspended" ? (
                      <p className="text-xs text-zinc-500">
                        {formatRelative(patient.moderation?.until || null)}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <PatientRiskBadge
                    riskLevel={patient.risk.level}
                    riskScore={patient.risk.score}
                  />
                </td>
                <td className="px-3 py-3 text-zinc-700">
                  {formatDate(patient.updatedAt)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Ellipsis className="size-4" /> Manage
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-56 p-2">
                        <div className="space-y-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => onOpenAction("suspend", patient)}
                          >
                            Suspend Patient
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-red-600"
                            onClick={() => onOpenAction("ban", patient)}
                          >
                            Ban Patient
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => onOpenAction("reactivate", patient)}
                          >
                            Reactivate Patient
                          </Button>
                          <div className="my-1 border-t" />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => onOpenAudit(patient)}
                          >
                            <History className="size-4" /> View History
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
