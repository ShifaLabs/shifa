import { Card, CardContent, CardHeader } from "@/shared/ui/card";

export default function AppointmentDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-4 md:p-6">
        <CardHeader>
          <div className="h-6 w-52 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="h-16 animate-pulse rounded bg-muted" />
          <div className="h-16 animate-pulse rounded bg-muted" />
          <div className="h-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className=" p-4 md:p-6">
          <CardContent className="space-y-3 py-6">
            <div className="h-5 w-44 animate-pulse rounded bg-muted" />
            <div className="h-4 w-60 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>

        <Card className=" p-4 md:p-6">
          <CardContent className="space-y-3 py-6">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
