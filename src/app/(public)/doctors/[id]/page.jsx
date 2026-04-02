import DoctorDetailsPage from "@/modules/doctor/components/DoctorDetailsPage";
import { getDoctorById } from "@/modules/appointment/appointments.doctors";

export default async function page({ params }) {
  const { id } = await params;
  if (!id) {
    return <div>Invalid doctor ID</div>;
  }
  const doctorDetails = await getDoctorById(id);
  return (
    <div>{doctorDetails && <DoctorDetailsPage doctor={doctorDetails} />}</div>
  );
}
