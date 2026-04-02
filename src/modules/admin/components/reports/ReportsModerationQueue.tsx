"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  CardWithPadding,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  ReportsActorType,
  ReportsDashboardData,
  ReportsModerationAction,
} from "@/modules/admin/types/reports-admin.types";

type Props = {
  loading?: boolean;
  queues: ReportsDashboardData["queues"];
  onModerate: (
    actorType: ReportsActorType,
    actorId: string,
    action: ReportsModerationAction,
  ) => void;
};

function formatDate(value?: string | null) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function moderationTone(state: string) {
  if (state === "banned") return "destructive" as const;
  if (state === "suspended") return "secondary" as const;
  return "outline" as const;
}

export default function ReportsModerationQueue({
  loading,
  queues,
  onModerate,
}: Props) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <CardWithPadding className="border-rose-200/70 bg-linear-to-br from-rose-50/60 via-white to-white">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <ShieldAlert className="size-4" />
            <CardTitle className="text-base">
              Patient Moderation Queue
            </CardTitle>
          </div>
          <CardDescription>
            Immediate interventions for users currently suspended or banned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading queue...</p>
          ) : queues.patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No high-priority patient actions right now.
            </p>
          ) : (
            queues.patients.map((row) => (
              <div
                key={row._id}
                className="rounded-xl border border-border/70 bg-card/90 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-900">{row.fullName}</p>
                    <p className="text-xs text-zinc-500">{row.email}</p>
                  </div>
                  <Badge variant={moderationTone(row.moderationState)}>
                    {row.moderationState}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Status: {row.status}
                </p>
                {row.moderationReason ? (
                  <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                    Reason: {row.moderationReason}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500">
                  Updated: {formatDate(row.updatedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onModerate("patient", row._id, "suspend")}
                  >
                    Suspend
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onModerate("patient", row._id, "ban")}
                  >
                    Ban
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onModerate("patient", row._id, "reactivate")}
                  >
                    Reactivate
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </CardWithPadding>

      <CardWithPadding className="border-amber-200/70 bg-linear-to-br from-amber-50/60 via-white to-white">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="size-4" />
            <CardTitle className="text-base">Doctor Moderation Queue</CardTitle>
          </div>
          <CardDescription>
            Fast controls for clinician accounts with active moderation state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading queue...</p>
          ) : queues.doctors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No high-priority doctor actions right now.
            </p>
          ) : (
            queues.doctors.map((row) => (
              <div
                key={row._id}
                className="rounded-xl border border-border/70 bg-card/90 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-zinc-900">{row.fullName}</p>
                    <p className="text-xs text-zinc-500">{row.email}</p>
                    <p className="text-xs text-zinc-500">
                      {row.specialization}
                    </p>
                  </div>
                  <Badge variant={moderationTone(row.moderationState)}>
                    {row.moderationState}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Status: {row.status}
                </p>
                {row.moderationReason ? (
                  <p className="mt-1 text-xs text-zinc-600 line-clamp-2">
                    Reason: {row.moderationReason}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-zinc-500">
                  Updated: {formatDate(row.updatedAt)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onModerate("doctor", row._id, "suspend")}
                  >
                    Suspend
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onModerate("doctor", row._id, "ban")}
                  >
                    Ban
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onModerate("doctor", row._id, "reactivate")}
                  >
                    Reactivate
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </CardWithPadding>
    </section>
  );
}
