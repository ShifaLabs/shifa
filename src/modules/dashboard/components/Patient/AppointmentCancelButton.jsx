"use client";

import AppointmentToast from "@/shared/ui/AppointmentToast";
import { useState } from "react";

const AppointmentCancelButton = ({ appointment }) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCancel = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/appointments/${appointment._id.toString()}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: "Cancelled" }),
        },
      );

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
  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-5 py-2 rounded-xl cursor-pointer border border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition"
      >
        Cancel Appointment
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-3">Cancel Appointment?</h2>

            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm border rounded-xl  cursor-pointer "
              >
                Keep Appointment
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer "
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
    </>
  );
};

export default AppointmentCancelButton;
