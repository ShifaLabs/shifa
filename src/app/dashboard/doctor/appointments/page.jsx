import MyAppointmentCard from "@/components/Dashboard/Doctors/MyAppointmentCard ";
import { getDoctorAppointmentsWithDetails } from "@/features/appointments/my-appointments.doctor";
import { authOptions } from "@/features/Auth/auth.config";
import { getServerSession } from "next-auth";

const MyAppointments = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="p-10 text-center text-red-500">Unauthorized</div>;
  }

  const appointments = await getDoctorAppointmentsWithDetails(
    session.user.doctorId,
  );

  return (
    <div className="  bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-8 text-gray-800">
        My Appointments
      </h1>

      {appointments.length === 0 ? (
        <div className="text-gray-500 text-center mt-20">
          No appointments found.
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
