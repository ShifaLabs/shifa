import {
  CalendarDays,
  Clock,
  CreditCard,
  Stethoscope,
  Video,
} from "lucide-react";
import Link from "next/link";
import AppointmentCancelButton from "./AppointmentCancelButton";

export default function PatientAppointmentCard({ appointment }) {
  const appointmentDate = new Date(appointment.appointmentDate);

  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCancel = ["PendingPayment", "Approved", "Confirmed"].includes(
    appointment.status,
  );
  const canPay =
    appointment.status === "PendingPayment" &&
    appointment.paymentStatus === "unpaid";

  const isPaid = appointment.paymentStatus === "paid";

  const getStatusStyle = () => {
    switch (appointment.status) {
      case "Confirmed":
        return "bg-primary/10 text-primary";
      case "PendingPayment":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-600";
      case "Expired":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-base-100 border border-base-200 shadow-md hover:shadow-xl transition rounded-2xl p-6">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-base-content">
            {appointment.doctorName}
          </h3>

          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Stethoscope size={14} />
            {appointment.specialization}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Appointment ID: {appointment.appointmentId}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle()}`}
          >
            {appointment.status}
          </span>

          {isPaid ? (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
              <CreditCard size={12} />
              Paid
            </span>
          ) : (
            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
              Unpaid
            </span>
          )}
        </div>
      </div>

      {/* Date Time */}
      <div className="flex gap-6 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} />
          {formattedDate}
        </div>

        <div className="flex items-center gap-2">
          <Clock size={16} />
          {formattedTime}
        </div>
      </div>

      {/* Consultation */}
      <div className="text-sm text-gray-600 mb-2">
        Consultation Type:
        <span className="font-medium text-base-content ml-1">
          {appointment.consultationType}
        </span>
      </div>

      {/* Symptoms */}
      {appointment.symptoms && (
        <div className="text-sm text-gray-600 mb-4">
          Symptoms:
          <span className="ml-1 text-base-content font-medium">
            {appointment.symptoms}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 flex-wrap">
        {/* View Details */}
        <Link
          href={`/dashboard/patient/appointments/${appointment._id}`}
          className="px-4 py-2 text-sm rounded-xl border border-base-300 hover:bg-base-200"
        >
          View Details
        </Link>

        {/* Pay */}
        {canPay && (
          <button className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer rounded-xl bg-primary text-white hover:bg-primary/90 transition">
            <CreditCard size={16} />
            Pay Now
          </button>
        )}

        {/* Join Meeting */}
        {appointment.consultationType === "video" &&
          appointment.status === "Approved" &&
          appointment.meetingLink && (
            <a
              href={appointment.meetingLink}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <Video size={16} />
              Join Meeting
            </a>
          )}

        {/* Cancel */}
        {canCancel && (
          <AppointmentCancelButton
            appointment={appointment}
          ></AppointmentCancelButton>
        )}
      </div>
    </div>
  );
}
