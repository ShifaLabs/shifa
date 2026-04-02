"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
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

type PieDatum = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  description: string;
  data: PieDatum[];
  loading: boolean;
  error: string;
  emptyMessage: string;
};

export default function PieChartCard({
  title,
  description,
  data,
  loading,
  error,
  emptyMessage,
}: Props) {
  const config = data.reduce((acc, item) => {
    acc[item.key] = {
      label: item.label,
      color: item.color,
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
        ) : data.length === 0 || data.every((item) => item.value === 0) ? (
          <ChartEmptyState message={emptyMessage} />
        ) : (
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="key"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
