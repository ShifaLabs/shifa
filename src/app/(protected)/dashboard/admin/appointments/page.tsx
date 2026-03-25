"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import AppointmentStatsCards from "@/modules/admin/components/appointments/AppointmentStatsCards";
import AppointmentFiltersBar from "@/modules/admin/components/appointments/AppointmentFiltersBar";
import AppointmentsTable from "@/modules/admin/components/appointments/AppointmentsTable";
import AppointmentBulkActionsBar from "@/modules/admin/components/appointments/AppointmentBulkActionsBar";
import AppointmentActionDialog from "@/modules/admin/components/appointments/AppointmentActionDialog";
import AppointmentAuditDialog from "@/modules/admin/components/appointments/AppointmentAuditDialog";
import {
  getAllAppointmentsAction,
  getAppointmentAuditTrailAction,
  runAppointmentAction,
  runBulkAppointmentAction,
} from "@/modules/admin/services/appointments-admin.action";
import {
  AppointmentAction,
  AppointmentAdminAuditEntry,
  AppointmentAdminListStats,
  AppointmentDateRange,
  AppointmentPaymentStatusFilter,
  AppointmentRow,
  AppointmentSortBy,
  AppointmentStatusFilter,
} from "@/modules/admin/types/appointment-admin.types";

const pageSize = 12;

const emptyStats: AppointmentAdminListStats = {
  total: 0,
  pendingPayment: 0,
  approved: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
  expired: 0,
  paid: 0,
  unpaid: 0,
  escalated: 0,
  noShow: 0,
  refundRequired: 0,
};

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [stats, setStats] = useState<AppointmentAdminListStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<AppointmentStatusFilter>("all");
  const [paymentStatus, setPaymentStatus] =
    useState<AppointmentPaymentStatusFilter>("all");
  const [dateRange, setDateRange] = useState<AppointmentDateRange>("all");
  const [sortBy, setSortBy] = useState<AppointmentSortBy>("appointmentDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRow | null>(null);
  const [currentAction, setCurrentAction] =
    useState<AppointmentAction>("escalate");
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [auditEntries, setAuditEntries] = useState<
    AppointmentAdminAuditEntry[]
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);

      const result = await getAllAppointmentsAction(page, pageSize, status, {
        search: debouncedSearch || undefined,
        paymentStatus,
        dateRange,
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        setAppointments([]);
        setStats(emptyStats);
        setMessage({
          type: "error",
          text: result.message || "Failed to load appointments",
        });
        return;
      }

      const rows = Array.isArray(result.data)
        ? (result.data as AppointmentRow[])
        : [];

      setAppointments(rows);
      setStats((result.stats as AppointmentAdminListStats) || emptyStats);
      setTotalPages(result.pagination?.totalPages || 1);
      setSelectedIds((prev) =>
        prev.filter((id) => rows.some((row) => row._id === id)),
      );
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
      setStats(emptyStats);
      setMessage({ type: "error", text: "Failed to load appointments" });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    status,
    debouncedSearch,
    paymentStatus,
    dateRange,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const allVisibleSelected =
    appointments.length > 0 &&
    appointments.every((appointment) => selectedIds.includes(appointment._id));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !appointments.some((row) => row._id === id)),
      );
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      appointments.forEach((row) => merged.add(row._id));
      return Array.from(merged);
    });
  };

  const openActionDialog = (
    action: AppointmentAction,
    appointment?: AppointmentRow,
  ) => {
    setCurrentAction(action);
    setSelectedAppointment(appointment || null);
    setReason("");
    setShowActionDialog(true);
  };

  const runSingleAction = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const result = await runAppointmentAction(
        selectedAppointment._id,
        currentAction,
        reason,
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setShowActionDialog(false);
        await fetchAppointments();
      }
    } catch (error) {
      console.error("Failed single action:", error);
      setMessage({
        type: "error",
        text: "Failed to process action",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const runBulkAction = async () => {
    if (!selectedIds.length) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const result = await runBulkAppointmentAction(
        selectedIds,
        currentAction,
        reason,
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setShowActionDialog(false);
        setSelectedIds([]);
        await fetchAppointments();
      }
    } catch (error) {
      console.error("Failed bulk action:", error);
      setMessage({ type: "error", text: "Failed to process bulk action" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!reason.trim()) {
      setMessage({ type: "error", text: "Reason is required for this action" });
      return;
    }

    if (selectedAppointment) {
      await runSingleAction();
      return;
    }

    await runBulkAction();
  };

  const openAuditDialog = async (appointment: AppointmentRow) => {
    setSelectedAppointment(appointment);
    setShowAuditDialog(true);
    setAuditEntries([]);

    try {
      setAuditLoading(true);
      const result = await getAppointmentAuditTrailAction(appointment._id, 40);
      if (result.success && Array.isArray(result.data)) {
        setAuditEntries(result.data as AppointmentAdminAuditEntry[]);
      }
    } catch (error) {
      console.error("Failed to load appointment history:", error);
    } finally {
      setAuditLoading(false);
    }
  };

  const headerSummary = useMemo(() => {
    return "Monitor consultation operations, intervene fast on risky cases, and keep every action fully auditable.";
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Appointments Operations Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {headerSummary}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchAppointments()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <AppointmentStatsCards stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>Appointments Governance List</CardTitle>
          <CardDescription>
            Filter system-wide appointments, execute interventions, and review
            detailed audit timelines.
          </CardDescription>

          <AppointmentFiltersBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={(value) => {
              setPaymentStatus(value);
              setPage(1);
            }}
            dateRange={dateRange}
            onDateRangeChange={(value) => {
              setDateRange(value);
              setPage(1);
            }}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          {message ? (
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <AlertTriangle className="size-4" />
              <span>{message.text}</span>
            </div>
          ) : null}

          <AppointmentBulkActionsBar
            selectedCount={selectedIds.length}
            loading={actionLoading}
            onEscalate={() => openActionDialog("escalate")}
            onCancel={() => openActionDialog("cancel")}
            onMarkNoShow={() => openActionDialog("markNoShow")}
            onMarkRefundRequired={() => openActionDialog("markRefundRequired")}
            onClear={() => setSelectedIds([])}
          />

          <AppointmentsTable
            loading={loading}
            rows={appointments}
            selectedIds={selectedIds}
            allVisibleSelected={allVisibleSelected}
            onToggleRow={toggleRow}
            onToggleAllVisible={toggleAllVisible}
            onOpenAction={openActionDialog}
            onOpenAudit={openAuditDialog}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AppointmentActionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        currentAction={currentAction}
        selectedAppointment={selectedAppointment}
        selectedCount={selectedIds.length}
        reason={reason}
        onReasonChange={setReason}
        loading={actionLoading}
        onConfirm={handleConfirmAction}
      />

      <AppointmentAuditDialog
        open={showAuditDialog}
        onOpenChange={setShowAuditDialog}
        loading={auditLoading}
        entries={auditEntries}
        selectedAppointment={selectedAppointment}
      />
    </div>
  );
}
