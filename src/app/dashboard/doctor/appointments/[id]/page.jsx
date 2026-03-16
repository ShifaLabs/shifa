import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VideoJoinButton from "@/components/Dashboard/Patient/VideoJoinButton";
import DoctorConfirmButton from "@/components/Dashboard/Doctor/DoctorConfirmButton";
import { getDoctorAppointmentDetails } from "@/features/appointments/appointments.doctor.service";

export default async function DoctorAppointmentDetailsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "doctor") {
    redirect("/login");
  }

  const { id } = await params;

  const appointment = await getDoctorAppointmentDetails(session.user.id, id);

  if (!appointment) {
    notFound();
  }

  const appointmentDate = new Date(appointment.appointmentDate);

  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canConfirm =
    appointment.status === "Approved" && appointment.paymentStatus === "paid";

  const showVideoJoin =
    ["Approved", "Confirmed"].includes(appointment.status) &&
    appointment.consultationType === "video" &&
    appointment.paymentStatus === "paid";
  const showVideoSection =
    appointment.consultationType === "video" &&
    appointment.paymentStatus === "paid";
  const meetingLink =
    appointment?.videoSession?.meetingLink ||
    `/consultation/${appointment._id}`;

  const statusColors = {
    PendingPayment: "bg-yellow-100 text-yellow-800",
    Approved: "bg-blue-100 text-blue-800",
    Confirmed: "bg-green-100 text-green-800",
    Completed: "bg-gray-100 text-gray-800",
    Cancelled: "bg-red-100 text-red-800",
    Expired: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-base-100 p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold mb-2">Appointment Details</h1>
          <p className="text-sm text-gray-500">
            Appointment ID: {appointment.appointmentId}
          </p>
        </div>

        {/* Patient Card */}
        <div className="bg-base-100 p-6 rounded-2xl shadow flex gap-6 items-center">
          {appointment.patientInfo?.profileImage ? (
            <Image
              src={appointment.patientInfo.profileImage}
              alt="Patient"
              width={90}
              height={90}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-22.5 h-22.5 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {appointment.patientInfo?.fullName?.[0] || "P"}
              </span>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold">
              {appointment.patientInfo?.fullName || "Patient"}
            </h2>

            <p className="text-gray-500 text-sm">
              {appointment.patientInfo?.email}
            </p>

            <p className="text-sm text-gray-500">
              Phone: {appointment.patientInfo?.phone || "N/A"}
            </p>

            {appointment.patientInfo?.age && (
              <p className="text-sm text-gray-500">
                Age: {appointment.patientInfo.age} | Gender:{" "}
                {appointment.patientInfo.gender || "N/A"}
              </p>
            )}
          </div>
        </div>

        {/* Appointment Information */}
        <div className="bg-base-100 p-6 rounded-2xl shadow space-y-4">
          <h2 className="text-lg font-semibold">Appointment Information</h2>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <p>
              <span className="font-medium">Date:</span> {formattedDate}
            </p>

            <p>
              <span className="font-medium">Time:</span> {formattedTime}
            </p>

            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status] || "bg-gray-100"}`}
              >
                {appointment.status}
              </span>
            </p>

            <p>
              <span className="font-medium">Consultation:</span>{" "}
              {appointment.consultationType}
            </p>

            <p>
              <span className="font-medium">Payment Status:</span>{" "}
              {appointment.paymentStatus === "paid" ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Paid
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Unpaid
                </span>
              )}
            </p>

            {appointment.payment?.amount && (
              <p>
                <span className="font-medium">Amount:</span>{" "}
                {appointment.payment.currency} {appointment.payment.amount}
              </p>
            )}
          </div>

          {appointment.symptoms && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Patient Symptoms:</p>
              <p className="text-sm text-gray-700">{appointment.symptoms}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-base-100 p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>

          <div className="flex flex-col gap-4">
            {showVideoSection && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-900">
                  Unique Consultation Link
                </p>
                <a
                  href={meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 underline break-all"
                >
                  {meetingLink}
                </a>
                <p className="text-xs text-emerald-800">
                  Only the assigned doctor and patient can join this room.
                </p>
              </div>
            )}

            {showVideoSection && (
              <Link
                href={meetingLink}
                className="inline-flex w-fit items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Open Consultation Room
              </Link>
            )}

            {showVideoJoin && <VideoJoinButton appointment={appointment} />}

            <div className="flex flex-wrap gap-4">
              {canConfirm && (
                <DoctorConfirmButton appointmentId={appointment._id} />
              )}

              <Link
                href="/dashboard/doctor/appointments"
                className="px-5 py-2 rounded-xl border border-base-300 hover:bg-base-200 transition"
              >
                Back to Appointments
              </Link>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="bg-base-100 p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-6">Appointment Timeline</h2>

          <div className="space-y-4">
            {appointment.auditTrail?.map((item, index) => (
              <div key={index} className="border-l-2 border-primary pl-4">
                <p className="font-medium">{item.action}</p>

                <p className="text-sm text-gray-500">
                  {item.from || "None"} → {item.to}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(item.at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
