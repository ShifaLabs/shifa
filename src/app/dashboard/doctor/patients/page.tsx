import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import PatientsTabs from "./PatientsTabs";
import {
  getActivePatientsForDoctor,
  getPastPatientsForDoctor,
} from "@/features/patients/patients.doctor.service";

export default async function DoctorPatientsPage() {
  //   const session = await getServerSession(authOptions);

  //   if (!session) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <p className="text-lg font-medium">
  //           Please login to view your patients.
  //         </p>
  //       </div>
  //     );
  //   }

  //   const activePatients = await getActivePatientsForDoctor(session.user.id);
  //   const pastPatients = await getPastPatientsForDoctor(session.user.id);

  const doctorId = "69b64c20c5c00036c0804379";
  const activePatients = (await getActivePatientsForDoctor(doctorId)).map(
    (p) => ({
      ...p,
      _id: p._id.toString(),
      nextAppointment: p.nextAppointment?.toISOString(),
    }),
  );

  const pastPatients = (await getPastPatientsForDoctor(doctorId)).map((p) => ({
    ...p,
    _id: p._id.toString(),
    lastVisit: p.lastVisit?.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-content">My Patients</h1>
          <p className="text-sm text-gray-500">
            Manage and review patients who booked consultations with you
          </p>
        </div>

        <PatientsTabs
          activePatients={activePatients}
          pastPatients={pastPatients}
        />
      </div>
    </div>
  );
}
