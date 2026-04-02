"use client";

import { Clock3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { AdminSecurityEvent } from "@/modules/admin/types/profile-admin.types";

type Props = {
  events: AdminSecurityEvent[];
  loading: boolean;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminActivityTimelineCard({ events, loading }: Props) {
  return (
    <Card className=" p-4 md:p-6">
      <CardHeader>
        <CardTitle>Privileged Activity</CardTitle>
        <CardDescription>
          Recent high-privilege actions for transparency and incident review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading activity...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No privileged activity recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event._id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{event.action}</Badge>
                  {event.entityType ? (
                    <Badge variant="secondary">{event.entityType}</Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.reason || "No reason attached"}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3" />
                  {formatDate(event.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
