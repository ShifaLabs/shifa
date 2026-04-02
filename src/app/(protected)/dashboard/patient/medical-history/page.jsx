import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { getPatientAppointmentsForDashboard } from "@/modules/appointment/appointments.patient.service";

function formatDateTime(dateValue) {
  const value = new Date(dateValue);

  return {
    date: value.toLocaleDateString(),
    time: value.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default async function MedicalHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please login to view medical history.
      </div>
    );
  }

  const completedAppointments = await getPatientAppointmentsForDashboard(
    session.user.id,
    {
      tab: "completed",
    },
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Medical History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completed consultations and visit records are shown here.
        </p>
      </div>

      {completedAppointments.length === 0 ? (
        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <p className="text-sm text-slate-600">
            No completed consultation records found yet.
          </p>
          <Link
            href="/dashboard/patient/appointments?tab=upcoming"
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Go to Appointments
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {completedAppointments.map((item) => {
            const appointmentDateTime = formatDateTime(item.appointmentDate);

            return (
              <div
                key={item._id}
                className="border rounded-xl p-4 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.doctorName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.specialization}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {appointmentDateTime.date} at {appointmentDateTime.time}
                    </p>
                  </div>

                  <span className="text-xs px-3 py-1 rounded-full border bg-slate-50 text-slate-700">
                    Completed
                  </span>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/dashboard/patient/appointments/${item._id}`}
                    className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Appointment Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
