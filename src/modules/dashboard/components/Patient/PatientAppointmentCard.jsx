import { CalendarDays, Clock, CreditCard, Stethoscope } from "lucide-react";
import Link from "next/link";
import AppointmentCancelButton from "./AppointmentCancelButton";
import AppointmentPayNowButton from "./AppointmentPayNowButton";
import VideoJoinButton from "./VideoJoinButton";

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  switch (value) {
    case "pendingpayment":
      return "Scheduled";
    case "approved":
      return "Scheduled";
    case "confirmed":
      return "Confirmed";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "no-show":
      return "No-show";
    case "expired":
      return "Expired";
    case "scheduled":
      return "Scheduled";
    default:
      return status;
  }
}

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
  const isPaymentConfirmed =
    isPaid &&
    ["Approved", "Confirmed", "confirmed", "Completed", "completed"].includes(
      appointment.status,
    );
  const isConfirmedStatus = ["Confirmed", "confirmed"].includes(
    appointment.status,
  );
  const hasVideoSession =
    appointment.consultationType === "video" &&
    appointment.paymentStatus === "paid" &&
    isConfirmedStatus &&
    Boolean(appointment.videoSession?.callId);

  const appointmentTimeText = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
            {normalizeStatus(appointment.status)}
          </span>

          {isPaymentConfirmed ? (
            <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <CreditCard size={12} />
              Payment Confirmed
            </span>
          ) : isPaid ? (
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

      {(appointment?.consultationSummary?.medicines ||
        appointment?.consultationSummary?.notes) && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900 space-y-2">
          <p className="font-semibold">Doctor Summary</p>
          {appointment?.consultationSummary?.medicines ? (
            <p>
              <span className="font-medium">Medicines:</span>{" "}
              {appointment.consultationSummary.medicines}
            </p>
          ) : null}
          {appointment?.consultationSummary?.notes ? (
            <p>
              <span className="font-medium">Notes:</span>{" "}
              {appointment.consultationSummary.notes}
            </p>
          ) : null}
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
        {canPay && <AppointmentPayNowButton appointment={appointment} />}

        {/* Cancel */}
        {canCancel && (
          <AppointmentCancelButton
            appointment={appointment}
          ></AppointmentCancelButton>
        )}
      </div>

      {hasVideoSession && (
        <div className="mt-4 pt-4 border-t border-base-200 space-y-2">
          <p className="text-sm text-gray-700">
            Consultation starts at{" "}
            <span className="font-semibold">{appointmentTimeText}</span>
          </p>
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
          <VideoJoinButton appointment={appointment} />
        </div>
      )}
    </div>
  );
}
