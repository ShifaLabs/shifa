// // "use client";

// // import { useSession } from "next-auth/react";
// // import Loading from "../loading";
// // import { useRouter } from "next/navigation";

// // const Dashboard = () => {
// //   const { data: session, status } = useSession();
// //   const router = useRouter();
// //   console.log("status:", status);
// //   console.log("session:", session);

// //   if (status === "loading") return <Loading />;
// //   if (session.user.role === "patient") {
// //     router.push("/dashboard/patient");
// //   }
// //   if (session.user.role === "doctor") {
// //     router.push("/dashboard/doctor");
// //   }
// // };

// // export default Dashboard;


// "use client";

// export default function DashboardHome() {
//   const stats = [
//     { label: "Upcoming", value: 2, hint: "Next 7 days" },
//     { label: "Completed", value: 12, hint: "This month" },
//     { label: "Prescriptions", value: 5, hint: "Available" },
//     { label: "Payments", value: "৳1,450", hint: "This month" },
//   ];

//   const upcoming = [
//     {
//       id: "a1",
//       doctor: "Dr. Michael Chen",
//       specialization: "Cardiology",
//       date: "Mar 05, 2026 • 2:30 PM",
//       status: "Confirmed",
//     },
//     {
//       id: "a2",
//       doctor: "Dr. Fatima Rahman",
//       specialization: "Pediatrics",
//       date: "Mar 08, 2026 • 11:00 AM",
//       status: "Scheduled",
//     },
//   ];

//   return (
//     <section className="space-y-6">
//       <div className="flex items-start justify-between gap-4 flex-wrap">
//         <div>
//           <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
//           <p className="text-sm text-slate-500 mt-1">
//             Your overview—appointments, history, and quick actions.
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <a
//             href="/dashboard/appointments/book"
//             className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
//           >
//             Book Appointment
//           </a>
//           <a
//             href="/doctors"
//             className="px-4 py-2 rounded-xl border text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
//           >
//             Find Doctors
//           </a>
//         </div>
//       </div>

//       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         {stats.map((s) => (
//           <div key={s.label} className="border rounded-2xl p-5 bg-white shadow-sm">
//             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//               {s.label}
//             </p>
//             <div className="mt-2 flex items-end justify-between">
//               <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
//               <p className="text-xs text-slate-500">{s.hint}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid lg:grid-cols-3 gap-4">
//         <div className="lg:col-span-2 border rounded-2xl p-6 bg-white shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-lg font-semibold text-slate-900">
//               Upcoming Appointments
//             </h2>
//             <a
//               href="/dashboard/appointments"
//               className="text-sm font-medium text-slate-600 hover:text-slate-900"
//             >
//               View all →
//             </a>
//           </div>

//           <div className="space-y-3">
//             {upcoming.map((a) => (
//               <div
//                 key={a.id}
//                 className="border rounded-xl p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
//               >
//                 <div className="min-w-0">
//                   <p className="text-sm font-semibold text-slate-900 truncate">
//                     {a.doctor} • {a.specialization}
//                   </p>
//                   <p className="text-xs text-slate-500 mt-1">{a.date}</p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <span className="text-xs px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
//                     {a.status}
//                   </span>
//                   <a
//                     href={`/dashboard/consultation/${a.id}`}
//                     className="text-xs px-3 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90 transition"
//                   >
//                     Open
//                   </a>
//                 </div>
//               </div>
//             ))}

//             {upcoming.length === 0 && (
//               <div className="border rounded-xl p-6 text-center text-slate-600">
//                 No upcoming appointments yet.
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="border rounded-2xl p-6 bg-white shadow-sm">
//           <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

//           <div className="mt-4 space-y-3">
//             <a
//               href="/dashboard/profile"
//               className="block border rounded-xl p-4 hover:bg-slate-50 transition"
//             >
//               <p className="text-sm font-semibold text-slate-900">Update Profile</p>
//               <p className="text-xs text-slate-500 mt-1">
//                 Keep your contact info up-to-date
//               </p>
//             </a>

//             <a
//               href="/dashboard/medical-history"
//               className="block border rounded-xl p-4 hover:bg-slate-50 transition"
//             >
//               <p className="text-sm font-semibold text-slate-900">Medical History</p>
//               <p className="text-xs text-slate-500 mt-1">
//                 View records and prescriptions
//               </p>
//             </a>

//             <a
//               href="/dashboard/appointments"
//               className="block border rounded-xl p-4 hover:bg-slate-50 transition"
//             >
//               <p className="text-sm font-semibold text-slate-900">My Appointments</p>
//               <p className="text-xs text-slate-500 mt-1">
//                 Track upcoming & completed visits
//               </p>
//             </a>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }



// import { getServerSession } from "next-auth";
// import { redirect } from "next/navigation";

// // ✅ তোমার authOptions যেখানেই আছে, এই importটা ঠিক রাখো
// // যদি তোমার authOptions থাকে: src/features/Auth/auth.config.ts
// import { authOptions } from "@/features/Auth/auth.config";

// export default async function DashboardPage() {
//   const session = await getServerSession(authOptions);

//   // Not logged in → login page
//   if (!session) {
//     redirect("/login");
//   }

//   // Role-based redirect
//   const role = session?.user?.role;

//   if (role === "doctor") {
//     redirect("/dashboard/doctor");
//   }

//   if (role === "patient") {
//     redirect("/dashboard/patient");
//   }

//   if (role === "admin") {
//     redirect("/dashboard/admin");
//   }

//   // Fallback (যদি role missing থাকে)
//   redirect("/dashboard/profile");
// }


export default function DashboardHome() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="text-sm text-slate-500">
        Welcome! Use the sidebar to manage your appointments and profile.
      </p>
    </section>
  );
}