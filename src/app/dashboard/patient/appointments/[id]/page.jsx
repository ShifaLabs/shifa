import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";
import { dbConnect, collections } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AppointmentCancelButton from "@/components/Dashboard/Patient/AppointmentCancelButton";
import AppointmentPayNowButton from "@/components/Dashboard/Patient/AppointmentPayNowButton";

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

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const result = await appointmentsCollection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id),
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
    ])
    .toArray();

  const appointment = JSON.parse(JSON.stringify(result[0]));

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

  const canJoin =
    appointment.status === "Approved" &&
    appointment.consultationType === "video" &&
    appointment.videoSession?.callId;

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
            src={appointment.doctorInfo.profileImage}
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
              {appointment.paymentStatus}
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

          <div className="flex flex-wrap gap-4">
            {canPay && <AppointmentPayNowButton></AppointmentPayNowButton>}

            {canJoin && (
              <a
                href={appointment.videoSession?.callId}
                target="_blank"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Join Meeting
              </a>
            )}

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
