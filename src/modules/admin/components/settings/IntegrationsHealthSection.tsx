"use client";

import { Activity, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { IntegrationHealthResponse } from "@/modules/admin/types/settings-admin.types";

type Props = {
  loading: boolean;
  health: IntegrationHealthResponse | null;
  onRefresh: () => Promise<void>;
};

function getBadgeVariant(status: "operational" | "degraded" | "down") {
  if (status === "operational") {
    return "secondary" as const;
  }
  if (status === "degraded") {
    return "outline" as const;
  }
  return "destructive" as const;
}

export default function IntegrationsHealthSection({
  loading,
  health,
  onRefresh,
}: Props) {
  return (
    <Card className=" p-4 md:p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Integrations Health
        </CardTitle>
        <CardDescription>
          Live status for critical provider dependencies.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pb-6">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Health
        </Button>

        {health?.services?.length ? (
          health.services.map((service) => (
            <div
              key={service.key}
              className="space-y-1 rounded-xl border bg-background px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{service.label}</p>
                <Badge variant={getBadgeVariant(service.status)}>
                  {service.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{service.message}</p>
              <p className="text-xs text-muted-foreground">
                Latency: {service.latencyMs}ms
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            Health metrics will appear after the first successful check.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
