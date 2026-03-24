import AdminModulePlaceholder from "../_components/AdminModulePlaceholder";

export default function AdminDoctorsPage() {
  return (
    <AdminModulePlaceholder
      title="Doctors Management"
      route="/dashboard/admin/doctors"
      summary="Govern doctor onboarding, activation lifecycle, trust controls, and performance health."
      deliverables={[
        "Advanced doctor search, filters, and segmented lists",
        "Doctor profile governance with credential verification status",
        "Bulk lifecycle actions: activate, suspend, re-verify",
        "Doctor quality score and risk flags",
      ]}
    />
  );
}
