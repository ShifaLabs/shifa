"use client";

import { Ellipsis, History } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  AppointmentAction,
  AppointmentRow,
} from "@/modules/admin/types/appointment-admin.types";

type Props = {
  loading: boolean;
  rows: AppointmentRow[];
  selectedIds: string[];
  allVisibleSelected: boolean;
  onToggleRow: (id: string) => void;
  onToggleAllVisible: () => void;
  onOpenAction: (
    action: AppointmentAction,
    appointment?: AppointmentRow,
  ) => void;
  onOpenAudit: (appointment: AppointmentRow) => void;
};

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusTone(status?: string) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase();

  if (normalized === "completed" || normalized === "complete")
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (status === "Confirmed" || normalized === "confirmed")
    return "bg-blue-50 border-blue-200 text-blue-700";
  if (status === "Approved" || normalized === "approved")
    return "bg-cyan-50 border-cyan-200 text-cyan-700";
  if (status === "PendingPayment" || normalized === "pendingpayment")
    return "bg-amber-50 border-amber-200 text-amber-700";
  if (status === "Cancelled" || normalized === "cancelled")
    return "bg-zinc-100 border-zinc-300 text-zinc-700";
  if (status === "Expired" || normalized === "expired")
    return "bg-rose-50 border-rose-200 text-rose-700";
  return "bg-zinc-100 border-zinc-200 text-zinc-700";
}

function getPaymentTone(status?: string) {
  if (status === "paid")
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (status === "unpaid") return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-zinc-100 border-zinc-200 text-zinc-700";
}

export default function AppointmentsTable({
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
      <table className="w-full min-w-300 border-separate border-spacing-y-1 text-sm">
        <thead>
          <tr className="text-zinc-500">
            <th className="px-4 py-2 text-left">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={onToggleAllVisible}
                aria-label="Select all visible appointments"
              />
            </th>
            <th className="px-3 py-2 text-left">Appointment</th>
            <th className="px-3 py-2 text-left">Patient</th>
            <th className="px-3 py-2 text-left">Doctor</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Payment</th>
            <th className="px-3 py-2 text-left">Flags</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                Loading appointments...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                No appointments matched your filters.
              </td>
            </tr>
          ) : (
            rows.map((appointment) => (
              <tr key={appointment._id} className="align-top">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(appointment._id)}
                    onChange={() => onToggleRow(appointment._id)}
                    aria-label={`Select ${appointment.appointmentId || "appointment"}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {appointment.appointmentId || "Unknown ID"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatDateTime(appointment.appointmentDate)}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {appointment.patient?.fullName || "Unknown patient"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {appointment.patient?.email || "No email"}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-zinc-900">
                      {appointment.doctor?.fullName || "Unknown doctor"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {appointment.doctor?.specialization || "General"}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    variant="outline"
                    className={getStatusTone(appointment.status)}
                  >
                    {appointment.status || "unknown"}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    variant="outline"
                    className={getPaymentTone(appointment.paymentStatus)}
                  >
                    {appointment.paymentStatus || "unknown"}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {appointment.adminFlags?.escalated ? (
                      <Badge
                        variant="outline"
                        className="border-rose-300 bg-rose-50 text-rose-700"
                      >
                        Escalated
                      </Badge>
                    ) : null}
                    {appointment.adminFlags?.noShow ? (
                      <Badge
                        variant="outline"
                        className="border-orange-300 bg-orange-50 text-orange-700"
                      >
                        No-show
                      </Badge>
                    ) : null}
                    {appointment.adminFlags?.refundRequired ? (
                      <Badge
                        variant="outline"
                        className="border-amber-300 bg-amber-50 text-amber-700"
                      >
                        Refund
                      </Badge>
                    ) : null}
                    {!appointment.adminFlags?.escalated &&
                    !appointment.adminFlags?.noShow &&
                    !appointment.adminFlags?.refundRequired ? (
                      <span className="text-xs text-zinc-500">-</span>
                    ) : null}
                  </div>
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
                            onClick={() =>
                              onOpenAction("escalate", appointment)
                            }
                          >
                            Escalate
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                              onOpenAction("markNoShow", appointment)
                            }
                          >
                            Mark no-show
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() =>
                              onOpenAction("markRefundRequired", appointment)
                            }
                          >
                            Mark refund required
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-red-600"
                            onClick={() => onOpenAction("cancel", appointment)}
                          >
                            Force cancel
                          </Button>
                          <div className="my-1 border-t" />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => onOpenAudit(appointment)}
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
