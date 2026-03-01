// "use client";

// import { useMemo, useState } from "react";

// export default function MyAppointmentsPage() {
//   const [tab, setTab] = useState("upcoming");
//   const [search, setSearch] = useState("");

//   const data = useMemo(
//     () => [
//       {
//         id: "a1",
//         doctor: "Dr. Michael Chen",
//         type: "Video",
//         date: "Mar 05, 2026 • 2:30 PM",
//         status: "upcoming",
//       },
//       {
//         id: "a2",
//         doctor: "Dr. Fatima Rahman",
//         type: "Audio",
//         date: "Feb 14, 2026 • 10:00 AM",
//         status: "completed",
//       },
//     ],
//     []
//   );

//   const filtered = data
//     .filter((x) => x.status === tab)
//     .filter((x) => x.doctor.toLowerCase().includes(search.toLowerCase()));

//   return (
//     <section className="space-y-6">
//       <div className="flex items-start justify-between gap-4 flex-wrap">
//         <div>
//           <h1 className="text-2xl font-semibold text-slate-900">My Appointments</h1>
//           <p className="text-sm text-slate-500 mt-1">
//             Track upcoming and completed consultations.
//           </p>
//         </div>

//         <a
//           href="/dashboard/appointments/book"
//           className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
//         >
//           Book New
//         </a>
//       </div>

//       <div className="border rounded-2xl p-4 bg-white shadow-sm">
//         <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
//           <div className="flex gap-2">
//             <button
//               onClick={() => setTab("upcoming")}
//               className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
//                 tab === "upcoming"
//                   ? "bg-slate-900 text-white border-slate-900"
//                   : "hover:bg-slate-50"
//               }`}
//             >
//               Upcoming
//             </button>
//             <button
//               onClick={() => setTab("completed")}
//               className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
//                 tab === "completed"
//                   ? "bg-slate-900 text-white border-slate-900"
//                   : "hover:bg-slate-50"
//               }`}
//             >
//               Completed
//             </button>
//           </div>

//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by doctor..."
//             className="w-full md:w-80 border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-slate-200"
//           />
//         </div>

//         <div className="mt-4 space-y-3">
//           {filtered.map((a) => (
//             <div
//               key={a.id}
//               className="border rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
//             >
//               <div className="min-w-0">
//                 <p className="text-sm font-semibold text-slate-900 truncate">
//                   {a.doctor}
//                 </p>
//                 <p className="text-xs text-slate-500 mt-1">
//                   {a.type} • {a.date}
//                 </p>
//               </div>

//               <div className="flex gap-2">
//                 {tab === "upcoming" ? (
//                   <a
//                     href={`/dashboard/consultation/${a.id}`}
//                     className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:opacity-90 transition"
//                   >
//                     Join
//                   </a>
//                 ) : (
//                   <a
//                     href="/dashboard/medical-history"
//                     className="px-3 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
//                   >
//                     View Notes
//                   </a>
//                 )}

//                 <button className="px-3 py-2 rounded-xl border text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
//                   Details
//                 </button>
//               </div>
//             </div>
//           ))}

//           {filtered.length === 0 && (
//             <div className="border rounded-xl p-8 text-center text-slate-600">
//               No appointments found.
//             </div>
//           )}
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";

import { useState } from "react";

export default function BookAppointmentPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Book Appointment</h1>
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