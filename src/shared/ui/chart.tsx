"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/infrastructure/lib/legacy/utils";

export type ChartConfig = {
  [key: string]: {
    label?: string;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
}

export function ChartContainer({
  id,
  className,
  children,
  config,
}: React.ComponentProps<"div"> & { config: ChartConfig }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={id}
        className={cn(
          "h-75 w-full text-xs [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-legend-item-text]:text-foreground [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-text]:fill-muted-foreground",
          className,
        )}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export const ChartTooltip = RechartsPrimitive.Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  label,
  hideLabel = false,
  formatter,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  hideLabel?: boolean;
  formatter?: (value: unknown, name: string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 shadow-sm">
      {!hideLabel && label ? (
        <p className="mb-1 text-xs font-medium">{label}</p>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const key = String(entry.dataKey || entry.name || `item-${index}`);
          const item = config[key];
          const renderedValue = formatter
            ? formatter(entry.value, key)
            : `${entry.value}`;

          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-[2px]"
                  style={{
                    backgroundColor: entry.color || item?.color || "#8884d8",
                  }}
                />
                <span className="text-muted-foreground">
                  {item?.label || entry.name || key}
                </span>
              </div>
              <span className="font-medium text-foreground">
                {renderedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ChartLegend = RechartsPrimitive.Legend;

export function ChartLegendContent({ payload }: { payload?: any[] }) {
  const { config } = useChart();
  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-4">
      {payload.map((entry) => {
        const key = String(entry.dataKey || entry.value || "item");
        const item = config[key];

        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-[2px]"
              style={{
                backgroundColor: entry.color || item?.color || "#8884d8",
              }}
            />
            <span className="text-muted-foreground">
              {item?.label || entry.value || key}
            </span>
          </div>
        );
      })}
    </div>
  );
}
