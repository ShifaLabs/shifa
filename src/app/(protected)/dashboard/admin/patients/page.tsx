import AdminModulePlaceholder from "../_components/AdminModulePlaceholder";

export default function AdminPatientsPage() {
  return (
    <AdminModulePlaceholder
      title="Patients Management"
      route="/dashboard/admin/patients"
      summary="Manage patient lifecycle, account safety, and trust-abuse controls across the platform."
      deliverables={[
        "Patient identity and verification state visibility",
        "Risk indicators for fraud, abuse, and repeated failures",
        "Lifecycle controls: suspend, reactivate, case notes",
        "Patient support and dispute context panel",
      ]}
    />
  );
}
