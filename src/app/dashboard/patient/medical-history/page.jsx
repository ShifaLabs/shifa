"use client";

export default function MedicalHistoryPage() {
  const records = [
    {
      id: "m1",
      title: "General Consultation",
      date: "Feb 14, 2026",
      doctor: "Dr. Fatima Rahman",
      summary: "Diagnosis and treatment notes saved.",
    },
    {
      id: "m2",
      title: "Cardio Follow-up",
      date: "Jan 28, 2026",
      doctor: "Dr. Michael Chen",
      summary: "Prescription issued and lifestyle plan recommended.",
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Medical History</h1>
        <p className="text-sm text-slate-500 mt-1">
          View your records, diagnosis notes, and prescriptions.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border rounded-2xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Records</h2>
          <div className="mt-4 space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="border rounded-xl p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {r.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {r.date} • {r.doctor}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                    Saved
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-3">{r.summary}</p>

                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                    View Details
                  </button>
                  <button className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:opacity-90 transition">
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Prescriptions</h2>
          <p className="text-sm text-slate-600 mt-2">
            All your prescriptions will appear here.
          </p>

          <div className="mt-4 border rounded-xl p-4 bg-slate-50 text-slate-700 text-sm">
            No prescriptions to show right now.
          </div>

          <a
            href="/dashboard/appointments"
            className="mt-5 inline-flex w-full justify-center px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
          >
            Go to Appointments
          </a>
        </div>
      </div>
    </section>
  );
}


// export default function MedicalHistoryPage() {
//   return (
//     <section className="space-y-2">
//       <h1 className="text-2xl font-semibold text-slate-900">Medical History</h1>
//       <p className="text-sm text-slate-500">Records, diagnosis notes, prescriptions.</p>
//     </section>
//   );
// }