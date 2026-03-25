"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  CardWithPadding,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import { ReportsCharts as ReportsChartModel } from "@/modules/admin/types/reports-admin.types";

type Props = {
  data: ReportsChartModel;
};

const pieColors = ["#1F6F68", "#50B58B", "#ED8A3B", "#E05D5D", "#6B7A90"];

function currency(value: unknown) {
  if (typeof value !== "number") return "BDT 0";
  return `BDT ${value.toLocaleString()}`;
}

export default function ReportsCharts({ data }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CardWithPadding className="border-border/70">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-0">
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "#1F6F68" },
            }}
            className="h-65"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.revenueTrend}
                margin={{ top: 10, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => currency(value)}
                    />
                  }
                />
                <Line
                  dataKey="revenue"
                  type="monotone"
                  stroke="#1F6F68"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </CardWithPadding>

      <CardWithPadding className="border-border/70">
        <CardHeader>
          <CardTitle>Transaction Trend</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-0">
          <ChartContainer
            config={{
              transactions: { label: "Transactions", color: "#50B58B" },
            }}
            className="h-65"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.transactionTrend}
                margin={{ top: 10, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="transactions"
                  type="monotone"
                  stroke="#50B58B"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </CardWithPadding>

      <CardWithPadding className="border-border/70">
        <CardHeader>
          <CardTitle>Payment Status Mix</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-0">
          <ChartContainer
            config={{
              paid: { label: "Paid", color: "#1F6F68" },
              unpaid: { label: "Unpaid", color: "#ED8A3B" },
            }}
            className="h-65"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={data.paymentStatus}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.paymentStatus.map((entry, index) => (
                    <Cell
                      key={`${entry.label}-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </CardWithPadding>

      <CardWithPadding className="border-border/70">
        <CardHeader>
          <CardTitle>Payment Funnel</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-0">
          <ChartContainer
            config={{
              value: { label: "Count", color: "#2F8D84" },
            }}
            className="h-65"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.paymentFunnel}
                margin={{ top: 10, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={48}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#2F8D84" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </CardWithPadding>
    </div>
  );
}
