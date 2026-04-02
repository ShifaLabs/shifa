import AdminReportsClient from "@/modules/admin/components/reports/AdminReportsClient";
import { getAdminReportsDashboardAction } from "@/modules/admin/services/reports-admin.action";

export default async function AdminReportsPage() {
  const initialResult = await getAdminReportsDashboardAction("mtd");

  return (
    <AdminReportsClient initialRange="mtd" initialResult={initialResult} />
  );
}
