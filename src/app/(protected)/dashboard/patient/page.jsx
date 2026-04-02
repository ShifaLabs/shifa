import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import {
  expirePendingAppointmentsForPatient,
  getPatientAppointmentCountsForDashboard,
  getPatientAppointmentsForDashboard,
} from "@/modules/appointment/appointments.patient.service";

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

function getHoursUntil(dateValue) {
  const target = new Date(dateValue).getTime();
  const now = Date.now();
  return (target - now) / (1000 * 60 * 60);
}

function toTitleCase(value = "") {
  if (!value) return "General";
  return value
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export default async function PatientOverviewPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">Please login to continue.</p>
      </div>
    );
  }

  await expirePendingAppointmentsForPatient(session.user.id);
  const [appointmentSummary, upcomingAppointments, completedAppointments] =
    await Promise.all([
      getPatientAppointmentCountsForDashboard(session.user.id),
      getPatientAppointmentsForDashboard(session.user.id, {
        tab: "upcoming",
        limit: 4,
      }),
      getPatientAppointmentsForDashboard(session.user.id, {
        tab: "completed",
        limit: 6,
      }),
    ]);

  const [nextAppointment] = upcomingAppointments;
  const nextAppointmentHours = nextAppointment
    ? getHoursUntil(nextAppointment.appointmentDate)
    : null;
  const hasUrgentAppointment =
    nextAppointmentHours !== null &&
    nextAppointmentHours >= 0 &&
    nextAppointmentHours <= 24;

  const recentDoctors = [...upcomingAppointments, ...completedAppointments]
    .reduce((acc, appointment) => {
      const existing = acc.find(
        (item) => item.doctorName === appointment.doctorName,
      );

      if (!existing) {
        acc.push({
          doctorName: appointment.doctorName,
          specialization: appointment.specialization,
          appointmentId: appointment._id,
        });
      }

      return acc;
    }, [])
    .slice(0, 3);

  const summaryCards = [
    {
      label: "Upcoming",
      value: appointmentSummary.upcoming,
      href: "/dashboard/patient/appointments?tab=upcoming",
    },
    {
      label: "Completed",
      value: appointmentSummary.completed,
      href: "/dashboard/patient/appointments?tab=completed",
    },
    {
      label: "Cancelled",
      value: appointmentSummary.cancelled,
      href: "/dashboard/patient/appointments?tab=cancelled",
    },
    {
      label: "No-show",
      value: appointmentSummary["no-show"],
      href: "/dashboard/patient/appointments?tab=no-show",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h1 className="text-2xl font-semibold text-base-content">
          Patient Dashboard
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          Manage appointments, profile, consultations, and care support from one
          place.
        </p>
      </section>

      {hasUrgentAppointment ? (
        <section className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-base-content">
                Appointment Reminder
              </h2>
              <p className="mt-1 text-sm text-base-content/80">
                You have an appointment with {nextAppointment.doctorName} within
                the next 24 hours.
              </p>
            </div>
            <Link
              href={`/dashboard/patient/appointments/${nextAppointment._id}`}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Review appointment
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-base-300 bg-base-100 p-4 hover:bg-base-200"
          >
            <p className="text-sm text-base-content/70">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-base-content">
              {card.value}
            </p>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-base-content">
            Next Appointment
          </h2>
          <Link
            href="/dashboard/patient/appointments?tab=upcoming"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {!nextAppointment ? (
          <p className="mt-3 text-sm text-base-content/70">
            No upcoming appointments found.
          </p>
        ) : (
          <div className="mt-4 rounded-xl border border-base-300 p-4">
            <p className="text-base font-semibold text-base-content">
              {nextAppointment.doctorName}
            </p>
            <p className="mt-1 text-sm text-base-content/70">
              {toTitleCase(nextAppointment.specialization)}
            </p>
            <p className="mt-2 text-sm text-base-content/80">
              {formatDateTime(nextAppointment.appointmentDate).date} at{" "}
              {formatDateTime(nextAppointment.appointmentDate).time}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/dashboard/patient/appointments/${nextAppointment._id}`}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Open details
              </Link>
              <Link
                href="/dashboard/patient/appointments?tab=upcoming"
                className="rounded-lg border border-base-300 px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200"
              >
                Manage appointments
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-base-content">
              Your Doctors
            </h2>
            <Link
              href="/dashboard/patient/doctors"
              className="text-sm font-medium text-primary hover:underline"
            >
              Explore all
            </Link>
          </div>

          {recentDoctors.length === 0 ? (
            <p className="mt-3 text-sm text-base-content/70">
              Doctor suggestions will appear after your first appointment.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentDoctors.map((doctor) => (
                <div
                  key={doctor.appointmentId}
                  className="flex items-center justify-between rounded-lg border border-base-300 p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      {doctor.doctorName}
                    </p>
                    <p className="text-xs text-base-content/70">
                      {toTitleCase(doctor.specialization)}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/patient/doctors"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Find similar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
          <h2 className="text-lg font-semibold text-base-content">
            Care Tools
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/patient/doctors"
              className="rounded-xl border border-base-300 bg-base-100 p-4 hover:bg-base-200"
            >
              <p className="font-semibold text-base-content">Find Doctors</p>
              <p className="mt-1 text-sm text-base-content/70">
                Browse specialists and open doctor profiles.
              </p>
            </Link>

            <Link
              href="/dashboard/patient/chatbot"
              className="rounded-xl border border-base-300 bg-base-100 p-4 hover:bg-base-200"
            >
              <p className="font-semibold text-base-content">
                AI Symptom Assistant
              </p>
              <p className="mt-1 text-sm text-base-content/70">
                Describe symptoms and get specialist guidance.
              </p>
            </Link>

            <Link
              href="/dashboard/patient/hospitals"
              className="rounded-xl border border-base-300 bg-base-100 p-4 hover:bg-base-200"
            >
              <p className="font-semibold text-base-content">
                Nearby Hospitals
              </p>
              <p className="mt-1 text-sm text-base-content/70">
                View nearby facilities and distance on the map.
              </p>
            </Link>

            <Link
              href="/dashboard/patient/medical-history"
              className="rounded-xl border border-base-300 bg-base-100 p-4 hover:bg-base-200"
            >
              <p className="font-semibold text-base-content">Medical History</p>
              <p className="mt-1 text-sm text-base-content/70">
                Access completed consultation records.
              </p>
            </Link>
          </div>
          <Link
            href="/dashboard/patient/profile"
            className="mt-3 block rounded-xl border border-base-300 bg-base-100 p-4 hover:bg-base-200"
          >
            <p className="font-semibold text-base-content">Profile</p>
            <p className="mt-1 text-sm text-base-content/70">
              Update your details and communication preferences.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
