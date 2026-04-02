import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import Link from "next/link";
import PatientAppointmentCard from "@/modules/dashboard/components/Patient/PatientAppointmentCard";
import {
  expirePendingAppointmentsForPatient,
  getPatientAppointmentsForDashboard,
} from "@/modules/appointment/appointments.patient.service";

const APPOINTMENT_TABS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "no-show", label: "No-show" },
];

function resolveTab(rawTab) {
  const tab = Array.isArray(rawTab) ? rawTab[0] : rawTab;
  const allowedTabs = APPOINTMENT_TABS.map((item) => item.key);
  return allowedTabs.includes(tab) ? tab : "upcoming";
}

export default async function PatientAppointmentsPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">
          Please login to view appointments.
        </p>
      </div>
    );
  }

  const resolvedSearchParams =
    searchParams && typeof searchParams.then === "function"
      ? await searchParams
      : searchParams;
  const activeTab = resolveTab(resolvedSearchParams?.tab);

  await expirePendingAppointmentsForPatient(session.user.id);
  const appointments = await getPatientAppointmentsForDashboard(
    session.user.id,
    {
      tab: activeTab,
    },
  );

  return (
    <div className="min-h-screen bg-base-200 ">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-content">
            My Appointments
          </h1>
          <p className="text-sm text-gray-500">
            Track upcoming visits and consultation outcomes.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {APPOINTMENT_TABS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Link
                key={tab.key}
                href={`/dashboard/patient/appointments?tab=${tab.key}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-base-100 text-base-content hover:bg-base-300"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {appointments.length === 0 ? (
          <div className="bg-base-100 p-10 rounded-2xl shadow text-center">
            <h2 className="text-lg font-semibold mb-2">
              No {activeTab.replace("-", " ")} appointments
            </h2>
            <p className="text-gray-500 text-sm">
              Your {activeTab.replace("-", " ")} appointments will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <PatientAppointmentCard
                key={appointment._id.toString()}
                appointment={{
                  ...appointment,
                  _id: appointment._id.toString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
