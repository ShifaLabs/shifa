"use client";

import { LaptopMinimal, Smartphone, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { AdminSessionItem } from "@/modules/admin/types/profile-admin.types";

type Props = {
  sessions: AdminSessionItem[];
  loading: boolean;
  actionLoading: boolean;
  onRevoke: (sessionId: string) => Promise<void>;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminSessionsCard({
  sessions,
  loading,
  actionLoading,
  onRevoke,
}: Props) {
  return (
    <Card className=" p-4 md:p-6">
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>
          Review active and remembered sessions to reduce account exposure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active sessions were detected.
          </p>
        ) : (
          sessions.map((session) => {
            const isMobile = /android|iphone|ipad/i.test(
              session.userAgent || "",
            );
            return (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex rounded-md border p-2">
                    {isMobile ? (
                      <Smartphone className="size-4" />
                    ) : (
                      <LaptopMinimal className="size-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{session.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Last seen: {formatDate(session.lastSeenAt)}
                    </p>
                    {session.isCurrent ? (
                      <p className="mt-1 text-xs font-medium text-primary">
                        Current session
                      </p>
                    ) : null}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={session.isCurrent || actionLoading}
                  onClick={() => onRevoke(session.id)}
                >
                  <Trash2 className="size-4" />
                  Revoke
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
