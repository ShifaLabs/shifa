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
import PatientStatsCards from "@/modules/admin/components/patients/PatientStatsCards";
import PatientFiltersBar from "@/modules/admin/components/patients/PatientFiltersBar";
import PatientsTable from "@/modules/admin/components/patients/PatientsTable";
import PatientBulkActionsBar from "@/modules/admin/components/patients/PatientBulkActionsBar";
import PatientModerationDialog from "@/modules/admin/components/patients/PatientModerationDialog";
import PatientAuditDialog from "@/modules/admin/components/patients/PatientAuditDialog";
import {
  bulkModeratePatientsAction,
  getAllPatientsAction,
  getPatientAuditTrailAction,
  moderatePatientAction,
} from "@/modules/admin/services/patients-admin.action";
import {
  JoinedRange,
  ModerationFilter,
  PatientAdminListStats,
  PatientAuditEntry,
  PatientModerationAction,
  PatientRow,
  PatientSortBy,
  PatientStatusFilter,
  TrustLevel,
} from "@/modules/admin/types/patient-admin.types";

const pageSize = 12;

const emptyStats: PatientAdminListStats = {
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0,
  banned: 0,
  unverified: 0,
};

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [stats, setStats] = useState<PatientAdminListStats>(emptyStats);
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
  const [status, setStatus] = useState<PatientStatusFilter>("all");
  const [moderation, setModeration] = useState<ModerationFilter>("all");
  const [trustLevel, setTrustLevel] = useState<"all" | TrustLevel>("all");
  const [joinedRange, setJoinedRange] = useState<JoinedRange>("all");
  const [sortBy, setSortBy] = useState<PatientSortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(
    null,
  );
  const [currentAction, setCurrentAction] =
    useState<PatientModerationAction>("suspend");
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [auditEntries, setAuditEntries] = useState<PatientAuditEntry[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);

      const result = await getAllPatientsAction(page, pageSize, status, {
        search: debouncedSearch || undefined,
        moderationState: moderation,
        trustLevel,
        joinedRange,
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        setPatients([]);
        setStats(emptyStats);
        setMessage({
          type: "error",
          text: result.message || "Failed to load patients",
        });
        return;
      }

      const rows = Array.isArray(result.data)
        ? (result.data as PatientRow[])
        : [];
      setPatients(rows);
      setStats((result.stats as PatientAdminListStats) || emptyStats);
      setTotalPages(result.pagination?.totalPages || 1);
      setSelectedIds((prev) =>
        prev.filter((id) => rows.some((row) => row._id === id)),
      );
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      setPatients([]);
      setStats(emptyStats);
      setMessage({ type: "error", text: "Failed to load patients" });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    status,
    debouncedSearch,
    moderation,
    trustLevel,
    joinedRange,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const allVisibleSelected =
    patients.length > 0 &&
    patients.every((patient) => selectedIds.includes(patient._id));

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !patients.some((patient) => patient._id === id)),
      );
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      patients.forEach((patient) => merged.add(patient._id));
      return Array.from(merged);
    });
  };

  const openActionDialog = (
    action: PatientModerationAction,
    patient?: PatientRow,
  ) => {
    setCurrentAction(action);
    setSelectedPatient(patient || null);
    setReason("");
    setDurationDays("7");
    setShowModerationDialog(true);
  };

  const runSingleAction = async () => {
    if (!selectedPatient) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const result = await moderatePatientAction(
        selectedPatient._id,
        currentAction,
        reason || "Reactivated by admin",
        currentAction === "suspend" ? "duration" : undefined,
        currentAction === "suspend" ? Number(durationDays || 0) : undefined,
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setShowModerationDialog(false);
        await fetchPatients();
      }
    } catch (error) {
      console.error("Failed moderation action:", error);
      setMessage({
        type: "error",
        text: "Failed to process moderation action",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const runBulkAction = async (action: PatientModerationAction) => {
    if (!selectedIds.length) return;

    try {
      setActionLoading(true);
      setMessage(null);

      const result = await bulkModeratePatientsAction(
        selectedIds,
        action,
        reason || `Bulk ${action} by admin`,
        action === "suspend" ? "duration" : undefined,
        action === "suspend" ? Number(durationDays || 0) : undefined,
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setShowModerationDialog(false);
        setSelectedIds([]);
        await fetchPatients();
      }
    } catch (error) {
      console.error("Failed bulk moderation:", error);
      setMessage({ type: "error", text: "Failed to process bulk moderation" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmModeration = async () => {
    if (selectedPatient) {
      await runSingleAction();
      return;
    }

    await runBulkAction(currentAction);
  };

  const openAuditDialog = async (patient: PatientRow) => {
    setSelectedPatient(patient);
    setShowAuditDialog(true);
    setAuditEntries([]);

    try {
      setAuditLoading(true);
      const result = await getPatientAuditTrailAction(patient._id, 30);
      if (result.success && Array.isArray(result.data)) {
        setAuditEntries(result.data as PatientAuditEntry[]);
      }
    } catch (error) {
      console.error("Failed to load patient history:", error);
    } finally {
      setAuditLoading(false);
    }
  };

  const headerSummary = useMemo(() => {
    return "Moderate patient lifecycle, enforce safety controls, and track every admin action for compliance.";
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Patients Control Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            {headerSummary}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => fetchPatients()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <PatientStatsCards stats={stats} />

      <Card className="p-4 md:p-6">
        <CardHeader>
          <CardTitle>Patient Governance List</CardTitle>
          <CardDescription>
            Search and filter patient accounts, then run precise moderation with
            complete audit visibility.
          </CardDescription>
          <PatientFiltersBar
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            moderation={moderation}
            onModerationChange={(value) => {
              setModeration(value);
              setPage(1);
            }}
            trustLevel={trustLevel}
            onTrustLevelChange={(value) => {
              setTrustLevel(value);
              setPage(1);
            }}
            joinedRange={joinedRange}
            onJoinedRangeChange={(value) => {
              setJoinedRange(value);
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

          <PatientBulkActionsBar
            selectedCount={selectedIds.length}
            loading={actionLoading}
            onSuspend={() => openActionDialog("suspend")}
            onBan={() => openActionDialog("ban")}
            onReactivate={() => openActionDialog("reactivate")}
            onClear={() => setSelectedIds([])}
          />

          <PatientsTable
            loading={loading}
            rows={patients}
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

      <PatientModerationDialog
        open={showModerationDialog}
        onOpenChange={setShowModerationDialog}
        currentAction={currentAction}
        selectedPatient={selectedPatient}
        selectedCount={selectedIds.length}
        reason={reason}
        onReasonChange={setReason}
        durationDays={durationDays}
        onDurationChange={setDurationDays}
        loading={actionLoading}
        onConfirm={handleConfirmModeration}
      />

      <PatientAuditDialog
        open={showAuditDialog}
        onOpenChange={setShowAuditDialog}
        loading={auditLoading}
        entries={auditEntries}
        selectedPatient={selectedPatient}
      />
    </div>
  );
}
