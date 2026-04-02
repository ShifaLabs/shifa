"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import ReportsRangeSelector from "@/modules/admin/components/reports/ReportsRangeSelector";
import ReportsKpiCards from "@/modules/admin/components/reports/ReportsKpiCards";
import ReportsCharts from "@/modules/admin/components/reports/ReportsCharts";
import ReportsModerationQueue from "@/modules/admin/components/reports/ReportsModerationQueue";
import ReportsModerationDialog from "@/modules/admin/components/reports/ReportsModerationDialog";
import {
  getAdminReportsDashboardAction,
  runReportsModerationAction,
} from "@/modules/admin/services/reports-admin.action";
import {
  ReportsActorType,
  ReportsDashboardData,
  ReportsDashboardResult,
  ReportsModerationAction,
  ReportsRangeKey,
} from "@/modules/admin/types/reports-admin.types";

type Props = {
  initialRange: ReportsRangeKey;
  initialResult: ReportsDashboardResult;
};

type DialogState = {
  open: boolean;
  actorType: ReportsActorType;
  actorId: string;
  actorName: string;
  action: ReportsModerationAction;
};

const emptyData: ReportsDashboardData = {
  dateRange: {
    key: "mtd",
    startDate: new Date(0).toISOString(),
    endDate: new Date(0).toISOString(),
  },
  kpis: {
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    paymentFailures24h: 0,
    completedConsultations: 0,
    totalRevenue: 0,
    averageTransactionValue: 0,
    paymentSuccessRate: 0,
  },
  charts: {
    revenueTrend: [],
    transactionTrend: [],
    paymentStatus: [],
    paymentFunnel: [],
    specializationBreakdown: [],
    transactionHeatmap: [],
    topDoctors: [],
  },
  moderationSummary: {
    patientsSuspended: 0,
    patientsBanned: 0,
    doctorsSuspended: 0,
    doctorsBanned: 0,
    doctorsPendingApproval: 0,
  },
  queues: {
    patients: [],
    doctors: [],
  },
};

export default function AdminReportsClient({
  initialRange,
  initialResult,
}: Props) {
  const [range, setRange] = useState<ReportsRangeKey>(initialRange);
  const [data, setData] = useState<ReportsDashboardData>(
    initialResult.success && initialResult.data
      ? initialResult.data
      : emptyData,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(
    initialResult.success
      ? null
      : {
          type: "error",
          text: initialResult.message || "Failed to load reports",
        },
  );
  const [isPending, startTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    actorType: "patient",
    actorId: "",
    actorName: "",
    action: "suspend",
  });
  const [reason, setReason] = useState("");
  const [durationDays, setDurationDays] = useState("7");

  const fetchData = (nextRange: ReportsRangeKey) => {
    startTransition(async () => {
      const result = await getAdminReportsDashboardAction(nextRange);

      if (!result.success || !result.data) {
        setMessage({
          type: "error",
          text: result.message || "Failed to load reports",
        });
        return;
      }

      setData(result.data);
      setMessage(null);
    });
  };

  useEffect(() => {
    if (range === initialRange) return;
    fetchData(range);
  }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  const subtitle = useMemo(() => {
    return "Fast analytics, high-risk moderation queue, and compliance-ready intervention history for leadership decisions.";
  }, []);

  const openAction = (
    actorType: ReportsActorType,
    actorId: string,
    action: ReportsModerationAction,
  ) => {
    const actor =
      actorType === "patient"
        ? data.queues.patients.find((row) => row._id === actorId)
        : data.queues.doctors.find((row) => row._id === actorId);

    setDialog({
      open: true,
      actorType,
      actorId,
      actorName: actor?.fullName || "Unknown",
      action,
    });

    setReason("");
    setDurationDays("7");
  };

  const closeActionDialog = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const handleConfirmAction = () => {
    startActionTransition(async () => {
      const payload = {
        actorType: dialog.actorType,
        actorId: dialog.actorId,
        action: dialog.action,
        reason: reason || "Reactivated by admin",
        durationDays:
          dialog.action === "suspend" ? Number(durationDays || 0) : undefined,
      };

      const result = await runReportsModerationAction(payload);

      if (!result.success) {
        setMessage({
          type: "error",
          text: result.message || "Failed to run moderation action",
        });
        return;
      }

      setMessage({
        type: "success",
        text: result.message || "Action completed",
      });
      closeActionDialog();
      fetchData(range);
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="rounded-2xl border border-border/70 bg-linear-to-br from-teal-100/40 via-cyan-50/30 to-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Reports and Governance Center
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 md:text-base">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ReportsRangeSelector
              value={range}
              loading={isPending}
              onChange={setRange}
            />
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => fetchData(range)}
            >
              <RefreshCcw className="mr-2 size-4" /> Refresh
            </Button>
          </div>
        </div>
      </section>

      {message ? (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {message.type === "error" ? "Action required" : "Success"}
          </AlertTitle>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <ReportsKpiCards
        kpis={data.kpis}
        moderationSummary={data.moderationSummary}
      />

      <ReportsCharts data={data.charts} />

      <ReportsModerationQueue
        loading={isPending}
        queues={data.queues}
        onModerate={openAction}
      />

      <ReportsModerationDialog
        open={dialog.open}
        loading={isActionPending}
        actorType={dialog.actorType}
        actorName={dialog.actorName}
        action={dialog.action}
        reason={reason}
        durationDays={durationDays}
        onReasonChange={setReason}
        onDurationDaysChange={setDurationDays}
        onClose={closeActionDialog}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
