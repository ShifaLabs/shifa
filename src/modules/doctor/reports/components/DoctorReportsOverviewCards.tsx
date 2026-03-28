"use client";

import { CalendarCheck, Clock3, DollarSign, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorReportsOverview } from "../utils/doctor-reports.types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "0 min";
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

type Props = {
  overview: DoctorReportsOverview;
  loading: boolean;
};

export default function DoctorReportsOverviewCards({
  overview,
  loading,
}: Props) {
  const items = [
    {
      label: "Total Appointments",
      value: overview.totalAppointments,
      hint: "All consultations in selected range",
      icon: CalendarCheck,
    },
    {
      label: "Completed",
      value: overview.completed,
      hint: "Successfully completed consultations",
      icon: CalendarCheck,
    },
    {
      label: "Cancelled",
      value: overview.cancelled,
      hint: "Cancelled or expired consultations",
      icon: UserX,
    },
    {
      label: "No-show",
      value: overview.noShow,
      hint: "Missed consultations",
      icon: UserX,
    },
    {
      label: "Doctor Earnings (80%)",
      value: formatCurrency(overview.doctorEarnings || overview.totalEarnings),
      hint: "Net payout to doctor",
      icon: DollarSign,
    },
    {
      label: "Platform Share (20%)",
      value: formatCurrency(overview.platformEarnings),
      hint: "Shifa management share",
      icon: DollarSign,
    },
    {
      label: "Avg Consultation Duration",
      value: formatDuration(overview.avgConsultationDuration),
      hint: "From video session duration",
      icon: Clock3,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <Icon className="size-4 text-teal-700" />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-semibold tracking-tight">
                {loading ? "..." : item.value}
              </p>
              <p className="text-xs text-muted-foreground">{item.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
