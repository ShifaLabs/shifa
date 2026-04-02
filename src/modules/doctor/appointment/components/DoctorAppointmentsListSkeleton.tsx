import { Card, CardContent, CardHeader } from "@/shared/ui/card";

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function DoctorAppointmentsListSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <SkeletonLine className="h-7 w-52" />
        <SkeletonLine className="h-4 w-80" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <SkeletonLine key={idx} className="h-8 w-24" />
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <SkeletonLine className="h-9 w-full" />
          <SkeletonLine className="h-9 w-full md:w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonLine key={idx} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
