import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardWithPadding,
} from "@/shared/ui/card";

const kpiPreview = [
  { label: "Pending Doctor Reviews", value: "--", tone: "bg-amber-50" },
  { label: "Open Support Tickets", value: "--", tone: "bg-red-50" },
  { label: "Payment Failures (24h)", value: "--", tone: "bg-orange-50" },
  { label: "Completed Consultations", value: "--", tone: "bg-emerald-50" },
];

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

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 ">
      <div className="space-y-2">
        <Badge variant="secondary">Admin Command Center</Badge>
        <h1 className="text-3xl font-semibold text-zinc-900">Overview</h1>
        <p className="text-sm text-zinc-600 max-w-3xl">
          This dashboard is now secured for admin-only access. Next
          implementation phase will connect live metrics, risk alerts, and audit
          intelligence.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiPreview.map((item) => (
          <CardWithPadding key={item.label} className={item.tone}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-700">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-zinc-900">{item.value}</p>
              <p className="text-xs text-zinc-500 mt-1">
                Data wiring in progress
              </p>
            </CardContent>
          </CardWithPadding>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminModules.map((module) => (
          <CardWithPadding key={module.title} className="border-zinc-200">
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
          </CardWithPadding>
        ))}
      </section>
    </div>
  );
}
