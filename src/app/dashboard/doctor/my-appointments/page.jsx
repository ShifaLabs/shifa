import MyAppointmentCard from "@/components/Dashboard/Doctors/MyAppointmentCard ";
import { getConfirmedDoctorAppointments } from "@/features/appointments/my-appointments.doctor";
import { authOptions } from "@/features/Auth/auth.config";
import { getServerSession } from "next-auth";

const MyAppointments = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="p-10 text-center text-red-500">Unauthorized</div>;
  }

  let appointments = await getConfirmedDoctorAppointments(session.user.id);

  // Convert to plain JS objects
  appointments = appointments.map((a) => ({
    ...a,
    _id: a._id.toString(), // convert ObjectId to string
    appointmentDate: a.appointmentDate.toISOString(), // convert Date to string
  }));

  return (
    <div className="p-6 lg:p-10 min-h-screen">
      <h1 className="text-2xl font-semibold mb-8 text-gray-800">
        My Appointments
      </h1>

      {appointments.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">
          No confirmed appointments yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {appointments.map((appointment) => (
            <MyAppointmentCard
              key={appointment._id}
              appointment={appointment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
