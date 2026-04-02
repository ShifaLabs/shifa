import Link from "next/link";
import ShifaChatbot from "@/modules/chat/ShifaChatbot";

export default function PatientChatbotPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6">
        <h1 className="text-2xl font-semibold text-base-content">
          AI Symptom Assistant
        </h1>
        <p className="mt-2 text-sm text-base-content/70">
          Share symptoms in plain language to get specialist suggestions and
          relevant doctor recommendations.
        </p>
        <p className="mt-2 text-xs text-base-content/60">
          This assistant does not replace emergency care. For severe symptoms,
          contact emergency services immediately.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard/patient/doctors"
            className="rounded-lg border border-base-300 px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200"
          >
            Browse doctors
          </Link>
          <Link
            href="/dashboard/patient/appointments?tab=upcoming"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Go to appointments
          </Link>
        </div>
      </div>

      <ShifaChatbot />
    </div>
  );
}
