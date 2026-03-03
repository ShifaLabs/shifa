"use client";

import { useState } from "react";
import { CalendarDays, Clock, Stethoscope } from "lucide-react";
import AppointmentToast from "@/components/ui/AppointmentToast";

export default function PatientAppointmentCard({ appointment }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const appointmentDate = new Date(appointment.appointmentDate);

  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canCancel = ["PendingPayment", "Approved", "Confirmed"].includes(
    appointment.status,
  );

  const handleCancel = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/appointments/${appointment._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus: "Cancelled" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error, type: "error" });
        setLoading(false);
        return;
      }

      setShowConfirm(false);
      setToast({
        message: "Appointment cancelled successfully",
        type: "success",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error(error);
      setToast({ message: "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
    <div className="bg-base-100 shadow-md rounded-2xl p-6 border border-base-200 hover:shadow-lg transition">
      {/* Doctor Info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-base-content">
            Dr. {appointment.doctorName}
          </h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Stethoscope size={14} />
            {appointment.specialization}
          </p>
        </div>

        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle()}`}
        >
          {appointment.status}
        </span>
      </div>

      {/* Date & Time */}
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

      {/* Consultation Type */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Consultation Type:{" "}
          <span className="font-medium text-base-content">
            {appointment.consultationType}
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      {canCancel && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 text-sm font-medium cursor-pointer rounded-xl border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition"
          >
            Cancel Appointment
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold text-base-content mb-3">
              Cancel Appointment?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded-xl border border-base-300 cursor-pointer"
              >
                Keep Appointment
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm cursor-pointer rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <AppointmentToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
