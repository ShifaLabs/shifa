import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AppointmentCancelButton from "@/components/Dashboard/Patient/AppointmentCancelButton";
import AppointmentPayNowButton from "@/components/Dashboard/Patient/AppointmentPayNowButton";
import VideoJoinButton from "@/components/Dashboard/Patient/VideoJoinButton";
import { getPatientAppointmentDetails } from "@/features/appointments/appointments.patient.service";
import { getDoctorProfileImage } from "@/lib/utils";
import AuditTimeline from "@/components/Dashboard/Patient/AuditTimeline";

export default async function AppointmentDetailsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please login to view appointment.
      </div>
    );
  }

  const { id } = await params;

  const appointment = await getPatientAppointmentDetails(session.user.id, id);

  if (!appointment) {
    notFound();
  }

  const appointmentDate = new Date(appointment.appointmentDate);

  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canPay =
    appointment.status === "PendingPayment" &&
    appointment.paymentStatus === "unpaid";

  const canCancel = ["PendingPayment", "Confirmed", "Approved"].includes(
    appointment.status,
  );
  const isDevelopment = process.env.NODE_ENV !== "production";

  const showVideoSection =
    appointment.consultationType === "video" &&
    (appointment.paymentStatus === "paid" || isDevelopment);
  const showDemoVideoCall =
    appointment.paymentStatus === "paid" || isDevelopment;

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
  const meetingLink = appointment?.videoSession?.meetingLink;
  const consultationPath = `/consultation/${appointment._id}`;
  const uniqueConsultationLink = meetingLink || consultationPath;

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

        {/* Doctor Card */}
        <div className="bg-base-100 p-6 rounded-2xl shadow flex gap-6 items-center">
          <Image
            src={getDoctorProfileImage(
              appointment.doctorInfo.profileImage,
              appointment.doctorInfo.gender,
            )}
            alt="Doctor"
            width={90}
            height={90}
            className="rounded-full object-cover"
          />

          <div>
            <h2 className="text-lg font-semibold">
              {appointment.doctorInfo.fullName}
            </h2>

            <p className="text-gray-500 text-sm">
              {appointment.doctorInfo.specialization}
            </p>

            <p className="text-sm text-gray-500">
              Experience: {appointment.doctorInfo.experienceYears} years
            </p>

            <p className="text-sm text-gray-500">
              License: {appointment.doctorInfo.licenseNumber}
            </p>
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
              <span className="font-medium">Status:</span> {appointment.status}
            </p>

            <p>
              <span className="font-medium">Consultation:</span>{" "}
              {appointment.consultationType}
            </p>

            <p>
              <span className="font-medium">Payment Status:</span>{" "}
              {appointment.paymentStatus === "paid"
                ? "Payment Confirmed"
                : "Unpaid"}
            </p>

            {appointment.symptoms && (
              <p>
                <span className="font-medium">Symptoms:</span>{" "}
                {appointment.symptoms}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-base-100 p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>

          <div className="flex flex-col gap-4">
            {canPay && <AppointmentPayNowButton appointment={appointment} />}

            {showVideoSection && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-900">
                  Video Consultation
                </h3>

                <p className="text-xs text-emerald-800">
                  Join window: {joinFromText} - {joinUntilText}
                </p>

                {meetingLink ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-emerald-900">
                      Meeting Link
                    </p>
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 underline break-all"
                    >
                      {meetingLink}
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-800">
                    Meeting link is being prepared. The doctor may need to
                    confirm or initialize the session first.
                  </p>
                )}
              </div>
            )}

            {showVideoSection && <VideoJoinButton appointment={appointment} />}

            {showDemoVideoCall && (
              <Link
                href={uniqueConsultationLink}
                className="inline-flex w-fit items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Open Consultation Demo (Real Link)
              </Link>
            )}

            <div className="flex flex-wrap gap-4">
              {canCancel && (
                <AppointmentCancelButton
                  appointment={appointment}
                ></AppointmentCancelButton>
              )}

              <Link
                href="/dashboard/patient/appointments"
                className="px-5 py-2 rounded-xl border border-base-300 hover:bg-base-200 transition"
              >
                Back to Appointments
              </Link>
            </div>
          </div>
        </div>

        <AuditTimeline appointment={appointment} />
      </div>
    </div>
  );
}
