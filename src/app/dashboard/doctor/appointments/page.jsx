import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDoctorAppointmentsForDashboard } from "@/features/appointments/appointments.doctor.service";
import VideoJoinButton from "@/components/Dashboard/Patient/VideoJoinButton";

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
              const joinFrom = appointment?.videoSession?.joinFrom
                ? new Date(appointment.videoSession.joinFrom)
                : new Date(appointmentDate.getTime() - 10 * 60 * 1000);
              const joinUntil = appointment?.videoSession?.joinUntil
                ? new Date(appointment.videoSession.joinUntil)
                : new Date(appointmentDate.getTime() + 60 * 60 * 1000);
              const joinFromText = joinFrom.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const joinUntilText = joinUntil.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const hasMeetingLink =
                appointment.consultationType === "video" &&
                appointment.paymentStatus === "paid" &&
                Boolean(appointment.videoSession?.callId);

              const statusColors = {
                PendingPayment: "bg-yellow-100 text-yellow-800",
                Approved: "bg-blue-100 text-blue-800",
                Confirmed: "bg-green-100 text-green-800",
                Completed: "bg-gray-100 text-gray-800",
                Cancelled: "bg-red-100 text-red-800",
                Expired: "bg-gray-100 text-gray-600",
              };

              return (
                <div
                  key={appointment._id}
                  className="bg-base-100 rounded-2xl shadow hover:shadow-lg transition-all overflow-hidden"
                >
                  <Link
                    href={`/dashboard/doctor/appointments/${appointment._id}`}
                    className="block p-6"
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

                  {hasMeetingLink && (
                    <div className="mx-6 mb-6 pt-4 border-t border-base-200 space-y-3">
                      <p className="text-sm font-medium text-gray-700">
                        Video Consultation &mdash; Scheduled at{" "}
                        <span className="font-semibold">{formattedTime}</span>
                      </p>

                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800">
                        <p className="font-semibold mb-1">Join Window</p>
                        <p>
                          {joinFromText} &ndash; {joinUntilText} on{" "}
                          {formattedDate}
                        </p>
                      </div>

                      {appointment.videoSession?.meetingLink && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <p className="text-xs font-semibold text-emerald-800 mb-1">
                            Meeting Link
                          </p>
                          <a
                            href={appointment.videoSession.meetingLink}
                            className="text-xs text-emerald-700 underline break-all"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {appointment.videoSession.meetingLink}
                          </a>
                        </div>
                      )}

                      <VideoJoinButton
                        appointment={{
                          ...appointment,
                          _id: appointment._id.toString(),
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
