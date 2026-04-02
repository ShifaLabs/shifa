"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import {
  ChartEmptyState,
  ChartErrorState,
  ChartLoadingState,
} from "./ChartCardStates";

type SeriesConfig = {
  key: string;
  stroke: string;
  label: string;
};

type Props<T extends Record<string, unknown>> = {
  title: string;
  description: string;
  data: T[];
  xKey: keyof T;
  series: SeriesConfig[];
  loading: boolean;
  error: string;
  emptyMessage: string;
};

export default function LineChartCard<T extends Record<string, unknown>>({
  title,
  description,
  data,
  xKey,
  series,
  loading,
  error,
  emptyMessage,
}: Props<T>) {
  const config = series.reduce((acc, item) => {
    acc[item.key] = {
      label: item.label,
      color: item.stroke,
    };
    return acc;
  }, {} as ChartConfig);

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
              <LineChart
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
                <ChartLegend content={<ChartLegendContent />} />
                {series.map((item) => (
                  <Line
                    key={item.key}
                    dataKey={item.key}
                    type="monotone"
                    stroke={item.stroke}
                    strokeWidth={2.25}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
