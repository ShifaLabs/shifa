import Link from "next/link";

const frontendSections = [
  {
    title: "1) Doctor Dashboard Overview UI",
    route: "/dashboard/doctor",
    tasks: [
      "Show KPI cards: today appointments, upcoming, completed, no-show.",
      "Add quick widgets: next patient, pending confirmations, call-ready countdown.",
      "Add filters by status/date and search by patient name.",
      "Create loading, empty, and error states for all dashboard blocks.",
    ],
  },
  {
    title: "2) Doctor Appointments UI",
    route: "/dashboard/doctor/appointments",
    tasks: [
      "Build appointments list with tabs: today, upcoming, completed, cancelled, no-show.",
      "Show patient info, symptoms preview, payment status, consultation type.",
      "Add action buttons: confirm, cancel, mark no-show, join/start call.",
      "Add table/card responsive mode for desktop and mobile.",
    ],
  },
  {
    title: "3) Appointment Detail UI",
    route: "/dashboard/doctor/appointments/[id]",
    tasks: [
      "Display full patient profile summary (name, age, contact, history snippet).",
      "Display appointment timeline and audit trail.",
      "Display video session status and meeting link readiness.",
      "Add doctor notes panel and follow-up instruction panel.",
    ],
  },
  {
    title: "4) Doctor-Patient Communication UI",
    route: "/dashboard/doctor/patients",
    tasks: [
      "Keep Active and Past tabs with better filters and search.",
      "Add patient timeline drawer: past consultations and key symptoms.",
      "Add quick contact actions (message/call-ready context).",
      "Add follow-up reminders for returning patients.",
    ],
  },
  {
    title: "5) Consultation UI",
    route: "/consultation/[id]",
    tasks: [
      "Pre-call readiness check (camera, microphone, connection).",
      "Waiting room status (doctor joined/patient joined).",
      "In-call quick notes panel.",
      "Post-call summary modal (duration, notes, next step).",
    ],
  },
  {
    title: "6) Schedule Management UI",
    route: "/dashboard/doctor/schedule-management",
    tasks: [
      "Keep weekly availability editor and add calendar-style preview.",
      "Add block dates (vacation/leave) UI.",
      "Add slot duration presets and validation hints.",
      "Warn when changes affect existing bookings.",
    ],
  },
];

const backendSections = [
  {
    title: "1) Appointment APIs for Doctor",
    items: [
      "GET /api/appointments/doctor: return doctor-scoped list with patient summary and statuses.",
      "GET /api/appointments/doctor/:id (new): return full appointment detail with patient info and audit trail.",
      "PATCH /api/appointments/:id/status: enforce valid status transitions and role checks.",
      "PATCH /api/appointments/:id/notes (new): save doctor consultation notes and follow-up instructions.",
    ],
  },
  {
    title: "2) Patient Relationship APIs",
    items: [
      "GET /api/doctors/patients/active (new): active patients list with next appointment.",
      "GET /api/doctors/patients/past (new): past patients with last visit and visit count.",
      "GET /api/doctors/patients/:id/timeline (new): doctor-visible patient consultation timeline.",
    ],
  },
  {
    title: "3) Telemedicine APIs",
    items: [
      "POST /api/video/token: issue fresh token and verify doctor-patient access to appointment.",
      "POST /api/video/no-show: allow doctor to mark no-show after join window.",
      "POST /api/video/webhook: persist call events (joined, ended, duration, recordings).",
      "GET /api/video/session/:appointmentId (new): return call readiness/session metadata for UI.",
    ],
  },
  {
    title: "4) Scheduling APIs",
    items: [
      "GET /api/slots/:doctorId: return available time slots by date.",
      "POST /api/doctors/availability/update: save doctor recurring weekly availability.",
      "POST /api/doctors/availability/block-dates (new): save one-off blocked dates.",
      "GET /api/doctors/availability/preview (new): return computed calendar preview for frontend.",
    ],
  },
  {
    title: "5) Data and Security Requirements",
    items: [
      "Always resolve doctor from authenticated session (session.user.doctorId or mapped user id).",
      "Validate ObjectId for all doctor/patient/appointment ids.",
      "Apply role middleware for doctor-only protected endpoints.",
      "Add rate limiting and error handling wrappers on every route.",
      "Store audit trail for status/notes updates with performedBy and timestamp.",
    ],
  },
];

const implementationOrder = [
  "Build doctor appointments page (list + filters + quick actions).",
  "Build appointment details page and notes API.",
  "Integrate consultation readiness + call actions.",
  "Enhance patients page with timeline drawer.",
  "Improve schedule page with block dates and preview.",
  "Add analytics/reports after core flow is stable.",
];

export default function DoctorImplementationPlanPage() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">
          Doctor Dashboard Planning Route
        </p>
        <h1 className="mt-2 text-2xl md:text-3xl font-bold text-base-content">
          Doctor Dashboard Frontend + Backend Implementation Plan
        </h1>
        <p className="mt-3 text-sm text-base-content/70">
          Use this page as your build checklist. Each section maps route-level
          frontend tasks with backend/API responsibilities so features can be
          completed one by one.
        </p>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-xl font-semibold text-base-content">
          Frontend Route Plan
        </h2>
        <div className="mt-4 space-y-4">
          {frontendSections.map((section) => (
            <article
              key={section.title}
              className="rounded-xl border border-base-300 bg-base-50 p-4"
            >
              <h3 className="font-semibold text-base-content">
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-base-content/70">
                Target route:{" "}
                <span className="font-medium">{section.route}</span>
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-base-content/80 space-y-1">
                {section.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-xl font-semibold text-base-content">
          Backend/API Plan
        </h2>
        <div className="mt-4 space-y-4">
          {backendSections.map((section) => (
            <article
              key={section.title}
              className="rounded-xl border border-base-300 bg-base-50 p-4"
            >
              <h3 className="font-semibold text-base-content">
                {section.title}
              </h3>
              <ul className="mt-3 list-disc pl-5 text-sm text-base-content/80 space-y-1">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h2 className="text-xl font-semibold text-base-content">
          Recommended Build Order
        </h2>
        <ol className="mt-3 list-decimal pl-5 text-sm text-base-content/80 space-y-1">
          {implementationOrder.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-base-300 bg-base-100 p-6 text-sm text-base-content/80">
        <p>
          Existing doctor home route:{" "}
          <span className="font-medium">/dashboard/doctor</span>
        </p>
        <p className="mt-1">
          New planning route:{" "}
          <span className="font-medium">
            /dashboard/doctor/implementation-plan
          </span>
        </p>
        <div className="mt-4">
          <Link
            href="/dashboard/doctor"
            className="inline-flex rounded-lg border border-base-300 px-3 py-2 font-medium hover:bg-base-200"
          >
            Back to Doctor Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
