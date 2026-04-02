import Link from "next/link";
import Image from "next/image";
import { getDoctors } from "@/modules/appointment/appointments.doctors";
import { getDoctorProfileImage } from "@/infrastructure/lib/legacy/utils";
import DoctorCardClientActions from "@/modules/appointment/components/DoctorCardClientActions";

export default async function PatientDoctorsPage() {
  const response = await getDoctors({
    page: 1,
    limit: 24,
    isVerified: true,
  });

  const doctors = Array.isArray(response?.data) ? response.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-base-content">Doctors</h1>
        <p className="mt-1 text-sm text-base-content/70">
          Browse verified doctors and book your next consultation.
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-xl border border-base-300 bg-base-100 p-6">
          <p className="text-sm text-base-content/70">
            No doctors are available right now.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <article
              key={doctor._id}
              className="rounded-2xl border border-base-300 bg-base-100 p-5"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={getDoctorProfileImage(
                    doctor.profileImage,
                    doctor.gender,
                  )}
                  alt={doctor.fullName}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-base font-semibold text-base-content">
                    {doctor.fullName}
                  </h2>
                  <p className="text-sm text-base-content/70">
                    {doctor.specialization || "General"}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {doctor.experienceYears || 0} years experience
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/patient/doctors/${doctor._id}`}
                  className="inline-flex items-center rounded-lg border border-base-300 px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200"
                >
                  View Profile
                </Link>
                <DoctorCardClientActions doctor={doctor} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
