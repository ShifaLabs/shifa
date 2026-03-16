"use client";

import { Clock } from "lucide-react";

const days = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function AvailabilitySelector({
  availability,
  setAvailability,
}) {
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

  return (
    <div className="space-y-4">
      {availability.map((day, index) => (
        <div
          key={day.dayOfWeek}
          className="border border-zinc-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
        >
          <button
            type="button"
            onClick={() => toggleDay(index)}
            className={`h-12 rounded-xl font-bold transition ${
              day.enabled
                ? "bg-[#1F6F68] text-white"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            {day.label}
          </button>

          <input
            type="time"
            disabled={!day.enabled}
            value={day.startTime}
            onChange={(e) => updateField(index, "startTime", e.target.value)}
            className="input input-bordered rounded-xl"
          />

          <input
            type="time"
            disabled={!day.enabled}
            value={day.endTime}
            onChange={(e) => updateField(index, "endTime", e.target.value)}
            className="input input-bordered rounded-xl"
          />

          <select
            disabled={!day.enabled}
            value={day.slotDuration}
            onChange={(e) =>
              updateField(index, "slotDuration", Number(e.target.value))
            }
            className="select select-bordered rounded-xl"
          >
            <option value={15}>15 min</option>
            <option value={20}>20 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min</option>
          </select>

          <div className="flex items-center text-sm text-zinc-500">
            <Clock className="w-4 h-4 mr-1" />
            Slot Duration
          </div>
        </div>
      ))}
    </div>
  );
}
