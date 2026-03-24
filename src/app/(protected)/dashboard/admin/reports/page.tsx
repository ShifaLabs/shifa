import AdminModulePlaceholder from "../_components/AdminModulePlaceholder";

export default function AdminReportsPage() {
  return (
    <AdminModulePlaceholder
      title="Reports and Analytics"
      route="/dashboard/admin/reports"
      summary="Track strategic KPIs, operational trends, and compliance-ready exports for leadership."
      deliverables={[
        "Daily, weekly, and monthly performance reports",
        "Revenue, conversion, and churn trend visualizations",
        "Cohort analysis by doctor specialization and region",
        "Scheduled CSV/PDF exports with access controls",
      ]}
    />
  );
}
