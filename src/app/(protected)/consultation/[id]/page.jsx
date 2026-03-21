import VideoConsultationClient from "@/modules/video/VideoConsultationClient";

export default async function VideoConsultationPage({ params }) {
  const resolvedParams =
    params && typeof params.then === "function" ? await params : params;

  const rawId = resolvedParams?.id;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center text-white">
          <p>Invalid consultation link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900">
      <VideoConsultationClient appointmentId={appointmentId} />
    </div>
  );
}
