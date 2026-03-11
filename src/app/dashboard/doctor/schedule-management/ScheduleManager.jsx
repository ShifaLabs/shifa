"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import AppointmentToast from "@/components/ui/AppointmentToast";

export default function ScheduleManager({ initialAvailability, doctorId }) {
  const [availability, setAvailability] = useState(initialAvailability);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const toggleDay = (index) => {
    const updated = [...availability];
    updated[index].enabled = !updated[index].enabled;
    setAvailability(updated);
  };

  const updateField = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const saveSchedule = async () => {
    setLoading(true);

    const selectedDays = availability.filter((d) => d.enabled);

    if (selectedDays.length === 0) {
      setToastMessage({
        message: "Please enable at least one day.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    const res = await fetch("/api/doctors/availability", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorId,
        availability: selectedDays,
      }),
    });

    if (res.ok) {
      setToastMessage({
        message: "Schedule updated successfully.",
        type: "success",
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {availability.map((day, index) => (
        <div
          key={day.dayOfWeek}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200 items-stretch"
        >
          {/* Day Toggle */}
          <button
            type="button"
            onClick={() => toggleDay(index)}
            className={`h-full rounded-xl font-semibold transition-all duration-200 flex items-center justify-center cursor-pointer
             ${
               day.enabled
                 ? "bg-[#1F6F68] text-white hover:bg-[#185a54] hover:scale-[1.02]"
                 : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:scale-[1.02]"
             }`}
          >
            {day.label}
          </button>

          {/* Start Time */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-500 mb-1">
              Start Time
            </label>

            <input
              type="time"
              value={day.startTime}
              disabled={!day.enabled}
              onChange={(e) => updateField(index, "startTime", e.target.value)}
              className="h-11 border border-zinc-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#1F6F68] disabled:bg-zinc-100 disabled:text-zinc-400"
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-500 mb-1">
              End Time
            </label>

            <input
              type="time"
              value={day.endTime}
              disabled={!day.enabled}
              onChange={(e) => updateField(index, "endTime", e.target.value)}
              className="h-11 border border-zinc-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#1F6F68] disabled:bg-zinc-100 disabled:text-zinc-400"
            />
          </div>

          {/* Slot Duration */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-zinc-500 mb-1">
              Slot Duration
            </label>

            <select
              disabled={!day.enabled}
              value={day.slotDuration}
              onChange={(e) =>
                updateField(index, "slotDuration", Number(e.target.value))
              }
              className="h-11 border border-zinc-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-[#1F6F68] disabled:bg-zinc-100 disabled:text-zinc-400"
            >
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>
      ))}

      {/* Save Section */}
      <div className="flex justify-end pt-3">
        <button
          onClick={saveSchedule}
          disabled={loading}
          className="flex items-center gap-2 px-7 h-12 rounded-xl bg-[#1F6F68] text-white font-semibold shadow-sm hover:bg-[#185a54] hover:shadow-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          <Save size={18} />
          {loading ? "Saving..." : "Save Schedule"}
        </button>
      </div>
      {toastMessage && (
        <AppointmentToast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
