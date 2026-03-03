import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { collections, dbConnect } from "@/lib/dbConnect";
import PatientAppointmentCard from "@/components/Dashboard/Patient/PatientAppointmentCard";
import { ObjectId } from "mongodb";

export default async function PatientAppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">
          Please login to view appointments.
        </p>
      </div>
    );
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const appointments = await appointmentsCollection
    .aggregate([
      {
        $match: {
          patient: new ObjectId(session.user.id),
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
      {
        $project: {
          _id: 1,
          appointmentDate: 1,
          status: 1,
          consultationType: 1,
          doctorName: "$doctorInfo.fullName",
          specialization: "$doctorInfo.specialization",
        },
      },
      {
        $sort: { appointmentDate: -1 },
      },
    ])
    .toArray();

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-content">
            My Appointments
          </h1>
          <p className="text-sm text-gray-500">
            Manage your consultations and upcoming visits
          </p>
        </div>

        {/* Empty State */}
        {appointments.length === 0 ? (
          <div className="bg-base-100 p-10 rounded-2xl shadow text-center">
            <h2 className="text-lg font-semibold mb-2">No Appointments Yet</h2>
            <p className="text-gray-500 text-sm">
              Book your first consultation to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <PatientAppointmentCard
                key={appointment._id.toString()}
                appointment={{
                  ...appointment,
                  _id: appointment._id.toString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
