"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";

export function ChartLoadingState() {
  return (
    <div className="flex h-75 items-center justify-center text-sm text-muted-foreground">
      Loading chart...
    </div>
  );
}

export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-75 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function ChartErrorState({ message }: { message: string }) {
  return (
    <div className="py-4">
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Chart unavailable</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </div>
  );
}
