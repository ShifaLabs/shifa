import { Card, CardContent, CardHeader } from "@/shared/ui/card";

function BlockSkeleton({ className = "h-4 w-full" }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

export default function DoctorDashboardSkeleton() {
  return (
    <section className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <BlockSkeleton className="h-8 w-56" />
        <BlockSkeleton className="h-4 w-80" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader className="space-y-2">
              <BlockSkeleton className="h-4 w-24" />
              <BlockSkeleton className="h-7 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx}>
            <CardHeader>
              <BlockSkeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent className="space-y-2">
              <BlockSkeleton className="h-4 w-full" />
              <BlockSkeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <BlockSkeleton className="h-4 w-32" />
          <div className="grid gap-3 md:grid-cols-3">
            <BlockSkeleton className="h-9 w-full" />
            <BlockSkeleton className="h-9 w-full" />
            <BlockSkeleton className="h-9 w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, idx) => (
            <BlockSkeleton key={idx} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
