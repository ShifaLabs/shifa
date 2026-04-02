import {
  CardContent,
  CardHeader,
  CardTitle,
  CardWithPadding,
} from "@/shared/ui/card";
import { ReportsDashboardData } from "@/modules/admin/types/reports-admin.types";

type Props = {
  kpis: ReportsDashboardData["kpis"];
  moderationSummary: ReportsDashboardData["moderationSummary"];
};

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString()}`;
}

function formatNumber(value: number) {
  return value.toLocaleString();
}

const kpiPalette = [
  "from-teal-50 to-white",
  "from-cyan-50 to-white",
  "from-emerald-50 to-white",
  "from-orange-50 to-white",
  "from-rose-50 to-white",
  "from-sky-50 to-white",
  "from-lime-50 to-white",
  "from-amber-50 to-white",
  "from-indigo-50 to-white",
];

export default function ReportsKpiCards({ kpis, moderationSummary }: Props) {
  const cards = [
    {
      label: "Total Transactions",
      value: formatNumber(kpis.totalTransactions),
      hint: `${kpis.completedTransactions.toLocaleString()} paid`,
    },
    {
      label: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      hint: `Avg ticket ${formatCurrency(kpis.averageTransactionValue)}`,
    },
    {
      label: "Payment Success Rate",
      value: `${kpis.paymentSuccessRate.toFixed(2)}%`,
      hint: `${kpis.failedTransactions.toLocaleString()} failures in range`,
    },
    {
      label: "Failures in Last 24h",
      value: formatNumber(kpis.paymentFailures24h),
      hint: `${kpis.pendingTransactions.toLocaleString()} currently pending`,
    },
    {
      label: "Completed Consultations",
      value: formatNumber(kpis.completedConsultations),
      hint: "Operational throughput",
    },
    {
      label: "Patients Suspended",
      value: formatNumber(moderationSummary.patientsSuspended),
      hint: `${moderationSummary.patientsBanned.toLocaleString()} banned`,
    },
    {
      label: "Doctors Suspended",
      value: formatNumber(moderationSummary.doctorsSuspended),
      hint: `${moderationSummary.doctorsBanned.toLocaleString()} banned`,
    },
    {
      label: "Pending Doctor Approvals",
      value: formatNumber(moderationSummary.doctorsPendingApproval),
      hint: "Review queue pressure",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <CardWithPadding
          key={card.label}
          className={`bg-linear-to-br ${kpiPalette[index % kpiPalette.length]} border-border/70`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-900 xl:text-3xl">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-zinc-600">{card.hint}</p>
          </CardContent>
        </CardWithPadding>
      ))}
    </section>
  );
}
