import { notFound } from "next/navigation";
import DoctorDetailsPage from "@/modules/doctor/components/DoctorDetailsPage";
import { getDoctorById } from "@/modules/appointment/appointments.doctors";

export default async function PatientDoctorDetailsPage({ params }) {
  const resolvedParams =
    params && typeof params.then === "function" ? await params : params;
  const doctorId = resolvedParams?.doctorId;

  if (!doctorId) {
    notFound();
  }

  let doctor;

  try {
    doctor = await getDoctorById(doctorId);
  } catch {
    notFound();
  }

  return <DoctorDetailsPage doctor={doctor} />;
}
