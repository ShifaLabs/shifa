"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
} from "./ChartCardStates";

type Props<T extends Record<string, unknown>> = {
  title: string;
  description: string;
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  barColor: string;
  yLabel: string;
  loading: boolean;
  error: string;
  emptyMessage: string;
};

export default function BarChartCard<T extends Record<string, unknown>>({
  title,
  description,
  data,
  xKey,
  yKey,
  barColor,
  yLabel,
  loading,
  error,
  emptyMessage,
}: Props<T>) {
  const config: ChartConfig = {
    [String(yKey)]: {
      label: yLabel,
      color: barColor,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <ChartLoadingState />
        ) : error ? (
          <ChartErrorState message={error} />
        ) : data.length === 0 ? (
          <ChartEmptyState message={emptyMessage} />
        ) : (
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={String(xKey)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={String(yKey)}
                  fill={barColor}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
