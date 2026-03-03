export default function MyAppointmentsPage() {
  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold text-slate-900">My Appointments</h1>
      <p className="text-sm text-slate-500">Your upcoming & completed appointments.</p>

      <a
        href="/dashboard/appointments/book"
        className="inline-flex mt-4 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
      >
        Book New Appointment
      </a>
    </section>
  );
}