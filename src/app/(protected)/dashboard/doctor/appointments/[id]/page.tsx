import { notFound } from "next/navigation";
import DoctorAppointmentDetailPageClient from "@/modules/doctor/appointment/components/detail/DoctorAppointmentDetailPageClient";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

function isLikelyObjectId(value: string) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

export default async function DoctorAppointmentDetailPage({
  params,
}: PageProps) {
  const resolved =
    params && typeof (params as Promise<{ id: string }>)?.then === "function"
      ? await (params as Promise<{ id: string }>)
      : (params as { id: string });

  const id = String(resolved?.id || "");

  if (!isLikelyObjectId(id)) {
    notFound();
  }

  return <DoctorAppointmentDetailPageClient appointmentId={id} />;
}
