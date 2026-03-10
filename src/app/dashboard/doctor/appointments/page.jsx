import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDoctorAppointmentsForDashboard } from "@/features/appointments/appointments.doctor.service";

export default async function DoctorAppointmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "doctor") {
    redirect("/login");
  }

  const appointments = await getDoctorAppointmentsForDashboard(session.user.id);

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-base-100 p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-2">My Appointments</h1>
          <p className="text-sm text-gray-500">
            Manage your patient appointments and consultations
          </p>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="bg-base-100 p-12 rounded-2xl shadow text-center">
            <p className="text-gray-500">No appointments yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => {
              const appointmentDate = new Date(appointment.appointmentDate);
              const formattedDate = appointmentDate.toLocaleDateString();
              const formattedTime = appointmentDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const statusColors = {
                PendingPayment: "bg-yellow-100 text-yellow-800",
                Approved: "bg-blue-100 text-blue-800",
                Confirmed: "bg-green-100 text-green-800",
                Completed: "bg-gray-100 text-gray-800",
                Cancelled: "bg-red-100 text-red-800",
                Expired: "bg-gray-100 text-gray-600",
              };

              return (
                <Link
                  key={appointment._id}
                  href={`/dashboard/doctor/appointments/${appointment._id}`}
                  className="bg-base-100 p-6 rounded-2xl shadow hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {appointment.patientInfo?.fullName || "Patient"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status] || "bg-gray-100"}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Appointment ID:</span>{" "}
                          {appointment.appointmentId}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {formattedDate}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {formattedTime}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span>{" "}
                          {appointment.consultationType}
                        </p>
                      </div>

                      {appointment.symptoms && (
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Symptoms:</span>{" "}
                          {appointment.symptoms}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {appointment.paymentStatus === "paid" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unpaid
                        </span>
                      )}

                      {appointment.videoSession?.callId && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Video Ready
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
