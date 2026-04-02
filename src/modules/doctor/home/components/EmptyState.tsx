import { Card, CardContent } from "@/shared/ui/card";
import Link from "next/link";

export default function EmptyState() {
  return (
    <Card className="border-dashed p-4 md:p-6">
      <CardContent className="py-12 text-center">
        <p className="text-lg font-semibold text-foreground">
          No appointments found
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try changing your filters or update schedule availability.
        </p>
        <div className="mt-4">
          <Link
            href="/dashboard/doctor/schedule-management"
            className="inline-flex rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Manage schedule
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
