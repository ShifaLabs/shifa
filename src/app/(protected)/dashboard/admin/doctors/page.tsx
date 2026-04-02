"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  History,
  Ellipsis,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Textarea } from "@/shared/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  approveDoctorAction,
  bulkModerateDoctorsAction,
  getAllDoctorsAction,
  getDoctorAuditTrailAction,
  moderateDoctorAction,
  rejectDoctorAction,
} from "@/modules/auth/doctor-approval.action";

type StatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "inactive";
type ModerationFilter = "all" | "none" | "suspended" | "banned";
type SortBy = "createdAt" | "fullName" | "specialization";
type ActionKind = "approve" | "reject" | "suspend" | "ban" | "reactivate";
type BulkActionKind = "suspend" | "ban" | "reactivate";

type DoctorRecord = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  status?: string;
  approvalStatus?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  experienceYears?: number;
  consultationFee?: number;
  moderation?: {
    state?: "none" | "suspended" | "banned";
    reason?: string | null;
    until?: string | null;
  };
};

type AuditEntry = {
  _id: string;
  action: string;
  reason?: string | null;
  actorId?: string;
  createdAt: string;
  metadata?: Record<string, any>;
};

const pageSize = 12;

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

function getRiskLevel(doctor: DoctorRecord): "low" | "medium" | "high" {
  if (doctor.moderation?.state === "banned") return "high";
  if (doctor.moderation?.state === "suspended") return "medium";
  if (doctor.approvalStatus === "rejected") return "high";
  if (doctor.approvalStatus === "pending") return "medium";
  return "low";
}

function getQualityScore(doctor: DoctorRecord) {
  let score = 40;
  if (doctor.isVerified) score += 25;
  if (doctor.approvalStatus === "approved") score += 20;
  if ((doctor.experienceYears || 0) >= 5) score += 10;
  if ((doctor.consultationFee || 0) > 0) score += 5;
  return Math.max(0, Math.min(100, score));
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [moderationFilter, setModerationFilter] =
    useState<ModerationFilter>("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecord | null>(
    null,
  );
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionKind>("suspend");
  const [actionReason, setActionReason] = useState("");
  const [durationDays, setDurationDays] = useState("7");
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionKind>("suspend");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);

      const result = await getAllDoctorsAction(
        page,
        pageSize,
        statusFilter === "all" ? undefined : statusFilter,
        {
          search: debouncedSearch || undefined,
          specialization:
            specializationFilter === "all" ? undefined : specializationFilter,
          moderationState:
            moderationFilter === "all" ? undefined : moderationFilter,
          sortBy,
          sortOrder,
        },
      );

      if (!result.success) {
        setDoctors([]);
        setMessage({
          type: "error",
          text: result.message || "Failed to load doctors",
        });
        return;
      }

      const rows = Array.isArray(result.data)
        ? (result.data as DoctorRecord[])
        : [];
      setDoctors(rows);
      setTotalPages(result.pagination?.totalPages || 1);
      setSelectedIds((prev) =>
        prev.filter((id) => rows.some((d) => d._id === id)),
      );
    } catch (error) {
      console.error("Failed to load doctors:", error);
      setDoctors([]);
      setMessage({ type: "error", text: "Failed to load doctors" });
    } finally {
      setLoading(false);
    }
  }, [
    page,
    debouncedSearch,
    statusFilter,
    moderationFilter,
    specializationFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const stats = useMemo(() => {
    return doctors.reduce(
      (acc, doctor) => {
        if (doctor.status === "active") acc.active += 1;
        if (doctor.approvalStatus === "pending") acc.pending += 1;
        if (doctor.moderation?.state === "suspended") acc.suspended += 1;
        if (doctor.moderation?.state === "banned") acc.banned += 1;
        return acc;
      },
      { total: doctors.length, active: 0, pending: 0, suspended: 0, banned: 0 },
    );
  }, [doctors]);

  const allVisibleSelected =
    doctors.length > 0 &&
    doctors.every((doctor) => selectedIds.includes(doctor._id));

  const toggleRow = (doctorId: string) => {
    setSelectedIds((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !doctors.some((doctor) => doctor._id === id)),
      );
      return;
    }

    setSelectedIds((prev) => {
      const merged = new Set(prev);
      doctors.forEach((doctor) => merged.add(doctor._id));
      return Array.from(merged);
    });
  };

  const openActionDialog = (action: ActionKind, doctor?: DoctorRecord) => {
    setCurrentAction(action);
    setSelectedDoctor(doctor || null);
    setActionReason("");
    setDurationDays(action === "suspend" ? "7" : "");
    setShowActionDialog(true);
  };

  const performSingleAction = async () => {
    if (!selectedDoctor) return;

    try {
      setActionLoading(selectedDoctor._id);
      setMessage(null);
      let result: { success: boolean; message: string } = {
        success: false,
        message: "Unknown action",
      };

      if (currentAction === "approve") {
        result = await approveDoctorAction(selectedDoctor._id, "admin");
      }

      if (currentAction === "reject") {
        result = await rejectDoctorAction(selectedDoctor._id, actionReason);
      }

      if (
        currentAction === "suspend" ||
        currentAction === "ban" ||
        currentAction === "reactivate"
      ) {
        result = await moderateDoctorAction(
          selectedDoctor._id,
          currentAction,
          actionReason || "Moderated by admin",
          currentAction === "suspend" ? Number(durationDays || 0) : undefined,
        );
      }

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setShowActionDialog(false);
        await fetchDoctors();
      }
    } catch (error) {
      console.error("Failed to process action:", error);
      setMessage({ type: "error", text: "Failed to process action" });
    } finally {
      setActionLoading(null);
    }
  };

  const performBulkAction = async () => {
    if (selectedIds.length === 0) return;
    if (
      !(
        currentAction === "suspend" ||
        currentAction === "ban" ||
        currentAction === "reactivate"
      )
    ) {
      setMessage({
        type: "error",
        text: "Bulk action supports suspend, ban, and reactivate only.",
      });
      return;
    }

    try {
      setActionLoading("bulk");
      setMessage(null);
      const result = await bulkModerateDoctorsAction(
        selectedIds,
        currentAction,
        actionReason || "Bulk moderation",
        currentAction === "suspend" ? Number(durationDays || 0) : undefined,
      );

      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      });

      if (result.success) {
        setSelectedIds([]);
        setShowActionDialog(false);
        await fetchDoctors();
      }
    } catch (error) {
      console.error("Failed bulk action:", error);
      setMessage({ type: "error", text: "Failed to process bulk action" });
    } finally {
      setActionLoading(null);
    }
  };

  const openAuditDialog = async (doctor: DoctorRecord) => {
    try {
      setSelectedDoctor(doctor);
      setShowAuditDialog(true);
      setAuditEntries([]);
      setAuditLoading(true);

      const result = await getDoctorAuditTrailAction(doctor._id, 30);
      if (result.success) {
        setAuditEntries(
          Array.isArray(result.data) ? (result.data as AuditEntry[]) : [],
        );
      }
    } catch (error) {
      console.error("Failed to load doctor history:", error);
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 ">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Doctors Control Center
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            High-speed lifecycle governance with risk controls, bulk moderation,
            and action traceability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchDoctors()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button onClick={() => openActionDialog("reactivate")}>
            Mass Reactivate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Card className="gap-0 border border-border bg-background px-4 py-4">
          <div>
            <p className="text-muted-foreground text-xs">Visible Doctors</p>
            <p className="text-xl font-semibold">{stats.total}</p>
          </div>
        </Card>
        <Card className="gap-0 px-4 py-4">
          <div>
            <p className="text-muted-foreground text-xs">Active</p>
            <p className="text-xl font-semibold text-primary">{stats.active}</p>
          </div>
        </Card>
        <Card className="gap-0 px-4 py-4">
          <div>
            <p className="text-muted-foreground text-xs">Pending Review</p>
            <p className="text-xl font-semibold text-amber-600">
              {stats.pending}
            </p>
          </div>
        </Card>
        <Card className="gap-0 px-4 py-4">
          <div>
            <p className="text-muted-foreground text-xs">Suspended</p>
            <p className="text-xl font-semibold text-orange-600">
              {stats.suspended}
            </p>
          </div>
        </Card>
        <Card className="gap-0 px-4 py-4">
          <div>
            <p className="text-muted-foreground text-xs">Banned</p>
            <p className="text-xl font-semibold text-destructive">
              {stats.banned}
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Operational Doctor List</CardTitle>
            <CardDescription>
              Filter by lifecycle status, trust state, and specialty, then run
              precise or bulk actions.
            </CardDescription>
          </div>
          <div className="grid w-full gap-2 md:w-auto md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute left-3 top-2.5 size-4" />
              <Input
                placeholder="Search name, email, phone, license"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={moderationFilter}
              onValueChange={(value) => {
                setModerationFilter(value as ModerationFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Moderation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moderation</SelectItem>
                <SelectItem value="none">No Action</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={specializationFilter}
              onValueChange={(value) => {
                setSpecializationFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((specialization) => (
                  <SelectItem key={specialization} value={specialization}>
                    {specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}:${sortOrder}`}
              onValueChange={(value) => {
                const [nextSortBy, nextSortOrder] = value.split(":");
                setSortBy(nextSortBy as SortBy);
                setSortOrder(nextSortOrder as "asc" | "desc");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt:desc">Newest First</SelectItem>
                <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                <SelectItem value="fullName:asc">Name A-Z</SelectItem>
                <SelectItem value="specialization:asc">
                  Specialization A-Z
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          {message && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                message.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              <AlertTriangle className="size-4" />
              <span>{message.text}</span>
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium">
                {selectedIds.length} doctors selected
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={bulkAction}
                  onValueChange={(value) =>
                    setBulkAction(value as BulkActionKind)
                  }
                >
                  <SelectTrigger className="h-8 w-42.5">
                    <SelectValue placeholder="Bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspend">Suspend Selected</SelectItem>
                    <SelectItem value="ban">Ban Selected</SelectItem>
                    <SelectItem value="reactivate">
                      Reactivate Selected
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => openActionDialog(bulkAction)}>
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Table wrapper: center, max-w-4xl, dynamic width, horizontal scroll if needed */}
          <div className="w-full flex justify-center pt-4">
            <div className="max-w-4xl w-full overflow-x-auto rounded-lg border">
              <table className="w-full min-w-175 border-separate border-spacing-y-1 text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAllVisible}
                        aria-label="Select all visible doctors"
                      />
                    </th>
                    <th className="px-3 py-2 text-left">Doctor</th>
                    <th className="px-3 py-2 text-left">Specialization</th>
                    <th className="px-3 py-2 text-left">Approval</th>
                    <th className="px-3 py-2 text-left">Moderation</th>
                    <th className="px-3 py-2 text-left">Risk</th>
                    <th className="px-3 py-2 text-left">Quality</th>
                    <th className="w-55 px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" /> Loading
                          doctors...
                        </div>
                      </td>
                    </tr>
                  ) : doctors.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No doctors matched your filters.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => {
                      const risk = getRiskLevel(doctor);
                      const qualityScore = getQualityScore(doctor);
                      return (
                        <tr key={doctor._id} className="bg-card align-top">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(doctor._id)}
                              onChange={() => toggleRow(doctor._id)}
                              aria-label={`Select ${doctor.fullName || "doctor"}`}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {doctor.fullName || "Unnamed doctor"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {doctor.email || "No email"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {doctor.phone || "No phone"}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-medium">
                              {doctor.specialization || "General"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              License: {doctor.licenseNumber || "N/A"}
                            </p>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <Badge
                                variant={
                                  doctor.approvalStatus === "approved"
                                    ? "default"
                                    : doctor.approvalStatus === "rejected"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {doctor.approvalStatus || "unknown"}
                              </Badge>
                              <p className="text-muted-foreground text-xs">
                                Created {formatDate(doctor.createdAt)}
                              </p>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-1">
                              <Badge
                                variant={
                                  doctor.moderation?.state === "banned"
                                    ? "destructive"
                                    : "outline"
                                }
                              >
                                {doctor.moderation?.state || "none"}
                              </Badge>
                              {doctor.moderation?.state === "suspended" && (
                                <p className="text-muted-foreground text-xs">
                                  {formatRelative(
                                    doctor.moderation?.until || null,
                                  )}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Badge
                              variant={
                                risk === "high"
                                  ? "destructive"
                                  : risk === "medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {risk} risk
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="space-y-2">
                              <p className="text-sm font-semibold">
                                {qualityScore}
                              </p>
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${qualityScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {doctor.approvalStatus === "pending" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    openActionDialog("approve", doctor)
                                  }
                                >
                                  Approve
                                </Button>
                              )}

                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <Ellipsis className="size-4" /> Manage
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align="end"
                                  className="w-56 p-2"
                                >
                                  <div className="space-y-1">
                                    {doctor.approvalStatus === "pending" ? (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="w-full justify-start"
                                          onClick={() =>
                                            openActionDialog("reject", doctor)
                                          }
                                        >
                                          Reject Application
                                        </Button>
                                        <div className="my-1 border-t" />
                                      </>
                                    ) : null}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="w-full justify-start"
                                      onClick={() =>
                                        openActionDialog("suspend", doctor)
                                      }
                                    >
                                      Suspend Doctor
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="w-full justify-start text-destructive"
                                      onClick={() =>
                                        openActionDialog("ban", doctor)
                                      }
                                    >
                                      Ban Doctor
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="w-full justify-start"
                                      onClick={() =>
                                        openActionDialog("reactivate", doctor)
                                      }
                                    >
                                      Reactivate Doctor
                                    </Button>
                                    <div className="my-1 border-t" />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="w-full justify-start"
                                      onClick={() => openAuditDialog(doctor)}
                                    >
                                      <History className="size-4" /> View
                                      History
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
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

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {selectedDoctor
                ? `${currentAction} ${selectedDoctor.fullName || "doctor"}`
                : `Bulk ${currentAction}`}
            </DialogTitle>
            <DialogDescription>
              {selectedDoctor
                ? "This action will update doctor lifecycle state and be stored in the audit history."
                : `This action will update ${selectedIds.length} selected doctors.`}
            </DialogDescription>
          </DialogHeader>

          {(currentAction === "reject" ||
            currentAction === "suspend" ||
            currentAction === "ban") && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Action reason</p>
              <Textarea
                value={actionReason}
                onChange={(event) => setActionReason(event.target.value)}
                placeholder="Explain why this action is needed"
                rows={4}
              />
            </div>
          )}

          {currentAction === "suspend" && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Suspension duration (days)</p>
              <Input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
              />
            </div>
          )}

          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4" />
              <p>
                Moderation actions are tracked in audit logs. For destructive
                actions, always include a clear reason.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionDialog(false)}
              disabled={Boolean(actionLoading)}
            >
              Cancel
            </Button>
            <Button
              variant={currentAction === "ban" ? "destructive" : "default"}
              disabled={Boolean(actionLoading)}
              onClick={selectedDoctor ? performSingleAction : performBulkAction}
            >
              {actionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Confirm {currentAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Doctor Action History</DialogTitle>
            <DialogDescription>
              {selectedDoctor?.fullName || "Doctor"} lifecycle and moderation
              events.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-auto pr-2">
            {auditLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 size-4 animate-spin" /> Loading
                history...
              </div>
            ) : auditEntries.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No action history found for this doctor.
              </p>
            ) : (
              auditEntries.map((entry) => (
                <div key={entry._id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{entry.action}</Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    {entry.reason || "No reason provided"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Actor: {entry.actorId || "unknown"}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
