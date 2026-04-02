import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { CardContent, CardHeader, CardTitle, Card } from "@/components/ui/card";
import AdminAnalyticsCharts from "./_components/AdminAnalyticsCharts";
import { getAdminOverviewAnalytics } from "@/modules/admin/analytics/analytics.service";

const adminModules = [
  {
    title: "Doctors",
    description:
      "Manage verification, approval lifecycle, and profile quality.",
    href: "/dashboard/admin/doctors",
  },
  {
    title: "Doctor Approvals",
    description: "Review pending applications and complete approval decisions.",
    href: "/dashboard/admin/doctor-approvals",
  },
  {
    title: "Patients",
    description: "Track patient account lifecycle and trust controls.",
    href: "/dashboard/admin/patients",
  },
  {
    title: "Appointments",
    description: "Monitor appointment funnel and intervention needs.",
    href: "/dashboard/admin/appointments",
  },
  {
    title: "Reports",
    description: "Operational and business intelligence dashboards.",
    href: "/dashboard/admin/reports",
  },
  {
    title: "Settings",
    description: "Policy and system controls for platform governance.",
    href: "/dashboard/admin/settings",
  },
];

function formatKpiNumber(value: number) {
  return value.toLocaleString();
}

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString()}`;
}

export default async function AdminDashboardPage() {
  const analytics = await getAdminOverviewAnalytics("mtd");
  console.log("Admin overview analytics:", analytics);
  const kpiPreview = [
    {
      label: "Total Transactions (MTD)",
      value: formatKpiNumber(analytics.kpis.totalTransactions),
      hint: `${analytics.kpis.completedTransactions} paid`,
      tone: "bg-emerald-50",
    },
    {
      label: "Total Revenue (MTD)",
      value: formatCurrency(analytics.kpis.totalRevenue),
      hint: `Avg value ${formatCurrency(analytics.kpis.averageTransactionValue)}`,
      tone: "bg-blue-50",
    },
    {
      label: "Payment Failures (24h)",
      value: formatKpiNumber(analytics.kpis.paymentFailures24h),
      hint: `${analytics.kpis.failedTransactions} failures in selected range`,
      tone: "bg-orange-50",
    },
    {
      label: "Completed Consultations",
      value: formatKpiNumber(analytics.kpis.completedConsultations),
      hint: `${analytics.kpis.paymentSuccessRate}% payment success rate`,
      tone: "bg-violet-50",
    },
  ];

  return (
    <div className="space-y-8 ">
      <div className="space-y-2">
        <Badge variant="secondary">Admin Command Center | Fast Analytics</Badge>
        <h1 className="text-3xl font-semibold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-600 max-w-3xl">
          Month-to-date analytics are live with index-backed aggregation. This
          dashboard now shows transaction volume, revenue, payment reliability,
          and operational trends.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiPreview.map((item) => (
          <Card key={item.label} className={item.tone}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-zinc-700">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-900">{item.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{item.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <AdminAnalyticsCharts data={analytics.charts} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminModules.map((module) => (
          <Card key={module.title} className="border-zinc-200">
            <CardHeader>
              <CardTitle className="text-lg">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">{module.description}</p>
              <Link
                href={module.href}
                className="inline-flex text-sm font-medium text-[#1F6F68] hover:text-[#15524d]"
              >
                Open module
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
