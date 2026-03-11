"use client";

import { useState } from "react";

export default function BookAppointmentPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Book Appointment
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose a date & time and confirm.
        </p>
      </div>

      <div className="border rounded-2xl p-6 bg-white shadow-sm space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Time</label>
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 10:30 AM"
            className="mt-2 w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          onClick={() => alert("Booked (demo)!")}
          className="w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:opacity-90 transition"
          disabled={!date || !time}
        >
          Confirm Booking
        </button>
      </div>
    </section>
  );
}
