import { getDoctors } from "@/modules/appointment/appointments.doctors";
import DoctorList from "@/modules/doctor/components/DoctorList";

export default async function DoctorsPage() {
  // Server-side fetch for initial load
  const { data: doctors } = await getDoctors();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            আমাদের অভিজ্ঞ ডাক্তারগণ
          </h1>
        </div>
        <DoctorList doctors={doctors || []} />
      </div>
    </section>
  );
}
