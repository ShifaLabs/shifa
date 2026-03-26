"use client";

import { RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import DoctorReportsOverviewCards from "./DoctorReportsOverviewCards";
import LineChartCard from "./LineChartCard";
import BarChartCard from "./BarChartCard";
import PieChartCard from "./PieChartCard";
import { useDoctorReports } from "../utils/use-doctor-reports";
import type { DoctorReportsRange } from "../utils/doctor-reports.types";

export default function DoctorReportsDashboardClient() {
  const [range, setRange] = useState<DoctorReportsRange>("30d");
  const [refreshNonce, setRefreshNonce] = useState(0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 ">
      <section className="rounded-2xl border border-border/70 bg-linear-to-br from-teal-100/40 via-cyan-50/40 to-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Doctor Reports
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-zinc-600 md:text-base">
              Track consultations, revenue, status outcomes, and patient
              engagement with backend-verified analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={range}
              onValueChange={(value) => setRange(value as DoctorReportsRange)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setRefreshNonce((prev) => prev + 1)}
            >
              <RefreshCcw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <DoctorReportsDashboardBody
        key={`${range}-${refreshNonce}`}
        range={range}
      />
    </div>
  );
}

function DoctorReportsDashboardBody({ range }: { range: DoctorReportsRange }) {
  const {
    overview,
    trends,
    earnings,
    statusDistribution,
    duration,
    topPatients,
  } = useDoctorReports(range);

  const distributionData = useMemo(
    () => [
      {
        key: "completed",
        label: "Completed",
        value: statusDistribution.data.percentages.completed,
        color: "#1F6F68",
      },
      {
        key: "cancelled",
        label: "Cancelled",
        value: statusDistribution.data.percentages.cancelled,
        color: "#E05D5D",
      },
      {
        key: "noShow",
        label: "No-show",
        value: statusDistribution.data.percentages.noShow,
        color: "#ED8A3B",
      },
    ],
    [
      statusDistribution.data.percentages.cancelled,
      statusDistribution.data.percentages.completed,
      statusDistribution.data.percentages.noShow,
    ],
  );

  return (
    <>
      <DoctorReportsOverviewCards
        overview={overview.data}
        loading={overview.loading}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <LineChartCard
          title="Consultation Trends"
          description="Completed, cancelled, and no-show consultations over time"
          data={trends.data}
          xKey="date"
          series={[
            { key: "completed", label: "Completed", stroke: "#1F6F68" },
            { key: "cancelled", label: "Cancelled", stroke: "#E05D5D" },
            { key: "noShow", label: "No-show", stroke: "#ED8A3B" },
          ]}
          loading={trends.loading}
          error={trends.error}
          emptyMessage="No consultations found for this period."
        />

        <BarChartCard
          title="Earnings"
          description={`Completed consultation earnings grouped by ${earnings.data.groupBy}`}
          data={earnings.data.items}
          xKey="label"
          yKey="earnings"
          yLabel="Earnings"
          barColor="#1F6F68"
          loading={earnings.loading}
          error={earnings.error}
          emptyMessage="No completed earnings found for this period."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PieChartCard
          title="Status Distribution"
          description="Share of completed, cancelled, and no-show outcomes"
          data={distributionData}
          loading={statusDistribution.loading}
          error={statusDistribution.error}
          emptyMessage="No status distribution available for this period."
        />

        <BarChartCard
          title="Consultation Duration"
          description="Duration buckets based on video session duration"
          data={duration.data}
          xKey="bucket"
          yKey="count"
          yLabel="Consultations"
          barColor="#6B7A90"
          loading={duration.loading}
          error={duration.error}
          emptyMessage="No completed consultations with duration data."
        />
      </div>

      <BarChartCard
        title="Top Patients"
        description="Top 5 patients by consultation count"
        data={topPatients.data.map((item) => ({
          label: item.fullName,
          visits: item.visits,
        }))}
        xKey="label"
        yKey="visits"
        yLabel="Visits"
        barColor="#50B58B"
        loading={topPatients.loading}
        error={topPatients.error}
        emptyMessage="No patient visit history available for this period."
      />
    </>
  );
}
