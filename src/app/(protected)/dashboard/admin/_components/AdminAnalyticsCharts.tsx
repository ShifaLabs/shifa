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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import { AdminOverviewAnalytics } from "@/modules/admin/analytics/analytics.service";

type Props = {
  data: AdminOverviewAnalytics["charts"];
};

const PIE_COLORS = ["#1F6F68", "#50B58B", "#ED8A3B", "#E05D5D", "#6B7A90"];

function currency(value: unknown) {
  if (typeof value !== "number") return "BDT 0";
  return `BDT ${value.toLocaleString()}`;
}

export default function AdminAnalyticsCharts({ data }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
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
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions Trend</CardTitle>
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
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
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
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
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
                margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions by Specialization</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-0">
          <ChartContainer
            config={{
              transactions: { label: "Transactions", color: "#499AC7" },
            }}
            className="h-75"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.specializationBreakdown}
                layout="vertical"
                margin={{ top: 10, right: 16, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="specialization"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="transactions"
                  radius={[0, 8, 8, 0]}
                  fill="#499AC7"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Doctors by Transactions</CardTitle>
        </CardHeader>
        <CardContent className="pl-0 pr-0">
          <ChartContainer
            config={{
              transactions: { label: "Transactions", color: "#6857D9" },
            }}
            className="h-75"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topDoctors}
                layout="vertical"
                margin={{ top: 10, right: 16, left: 56, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="doctorName"
                  tickLine={false}
                  axisLine={false}
                  width={150}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="transactions"
                  radius={[0, 8, 8, 0]}
                  fill="#6857D9"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Transaction Heatmap by Day and Hour</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-1">
          {data.transactionHeatmap.length === 0 ? (
            <p className="col-span-12 text-sm text-zinc-500">
              No transaction heatmap data available for the selected range.
            </p>
          ) : (
            data.transactionHeatmap.map((cell, index) => {
              const intensity = Math.min(1, cell.transactions / 8);
              const alpha = 0.15 + intensity * 0.85;
              return (
                <div
                  key={`${cell.day}-${cell.hour}-${index}`}
                  className="rounded-md p-2 text-[11px]"
                  style={{ backgroundColor: `rgba(31, 111, 104, ${alpha})` }}
                  title={`${cell.day} ${cell.hour}:00 - ${cell.transactions} tx`}
                >
                  <p className="font-medium text-white">{cell.day}</p>
                  <p className="text-white/90">{cell.hour}:00</p>
                  <p className="text-white font-semibold">
                    {cell.transactions}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
