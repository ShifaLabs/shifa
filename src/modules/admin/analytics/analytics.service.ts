import "server-only";

import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

export type AdminDateRangeKey = "24h" | "7d" | "30d" | "mtd";

export type AdminOverviewAnalytics = {
  dateRange: {
    key: AdminDateRangeKey;
    startDate: string;
    endDate: string;
  };
  kpis: {
    totalTransactions: number;
    completedTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    paymentFailures24h: number;
    completedConsultations: number;
    totalRevenue: number;
    averageTransactionValue: number;
    paymentSuccessRate: number;
  };
  charts: {
    revenueTrend: Array<{ label: string; revenue: number }>;
    transactionTrend: Array<{ label: string; transactions: number }>;
    paymentStatus: Array<{ label: string; value: number }>;
    paymentFunnel: Array<{ label: string; value: number }>;
    specializationBreakdown: Array<{
      specialization: string;
      transactions: number;
      revenue: number;
    }>;
    transactionHeatmap: Array<{
      day: string;
      hour: number;
      transactions: number;
    }>;
    topDoctors: Array<{
      doctorName: string;
      specialization: string;
      transactions: number;
      revenue: number;
    }>;
  };
};

type DateRange = { start: Date; end: Date };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function resolveDateRange(key: AdminDateRangeKey = "mtd"): DateRange {
  const now = new Date();
  const end = now;

  if (key === "24h") {
    return { start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end };
  }

  if (key === "7d") {
    return {
      start: startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)),
      end,
    };
  }

  if (key === "30d") {
    return {
      start: startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)),
      end,
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
    end,
  };
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return 0;
}

function formatDayLabel(dateValue: Date | string | number) {
  const date = new Date(dateValue);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function asRangeKey(value?: string): AdminDateRangeKey {
  if (value === "24h" || value === "7d" || value === "30d" || value === "mtd") {
    return value;
  }
  return "mtd";
}

export async function getAdminOverviewAnalytics(
  requestedRange?: string,
): Promise<AdminOverviewAnalytics> {
  const rangeKey = asRangeKey(requestedRange);
  const { start, end } = resolveDateRange(rangeKey);
  const failuresWindowStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const failureThresholdDate = new Date(Date.now() - 60 * 60 * 1000);

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const [
    totalTransactions,
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    paymentFailures24h,
    completedConsultations,
    revenueAgg,
    revenueTrend,
    transactionTrend,
    paymentStatus,
    paymentFunnel,
    specializationBreakdown,
    transactionHeatmap,
    topDoctors,
  ] = await Promise.all([
    appointmentsCollection.countDocuments({
      createdAt: { $gte: start, $lte: end },
      "payment.transactionId": { $exists: true, $ne: null },
    }),
    appointmentsCollection.countDocuments({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: "paid",
    }),
    appointmentsCollection.countDocuments({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: "unpaid",
      "payment.initiatedAt": { $exists: true },
      updatedAt: { $gte: failureThresholdDate },
    }),
    appointmentsCollection.countDocuments({
      createdAt: { $gte: start, $lte: end },
      paymentStatus: "unpaid",
      "payment.initiatedAt": { $exists: true },
      updatedAt: { $lt: failureThresholdDate },
    }),
    appointmentsCollection.countDocuments({
      createdAt: { $gte: failuresWindowStart, $lte: end },
      paymentStatus: "unpaid",
      "payment.initiatedAt": { $exists: true },
      updatedAt: { $lt: failureThresholdDate },
    }),
    appointmentsCollection.countDocuments({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ["completed", "complete", "Completed"] },
    }),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$payment.amount", 0] } },
          },
        },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            paymentStatus: "paid",
            "payment.completedAt": { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$payment.completedAt",
              },
            },
            revenue: { $sum: { $ifNull: ["$payment.amount", 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            "payment.transactionId": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            "payment.transactionId": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$paymentStatus",
            value: { $sum: 1 },
          },
        },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            created: { $sum: 1 },
            initiated: {
              $sum: {
                $cond: [{ $ifNull: ["$payment.initiatedAt", false] }, 1, 0],
              },
            },
            paid: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0],
              },
            },
            completed: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      { $toLower: { $ifNull: ["$status", ""] } },
                      ["completed", "complete"],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            paymentStatus: "paid",
          },
        },
        {
          $lookup: {
            from: collections.DOCTORS,
            localField: "doctor",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: {
            path: "$doctorInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$doctorInfo.specialization", "Unknown"] },
            transactions: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$payment.amount", 0] } },
          },
        },
        { $sort: { transactions: -1 } },
        { $limit: 8 },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            "payment.transactionId": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: {
              dayOfWeek: { $dayOfWeek: "$createdAt" },
              hour: { $hour: "$createdAt" },
            },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { "_id.dayOfWeek": 1, "_id.hour": 1 } },
      ])
      .toArray(),
    appointmentsCollection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            paymentStatus: "paid",
          },
        },
        {
          $lookup: {
            from: collections.DOCTORS,
            localField: "doctor",
            foreignField: "_id",
            as: "doctorInfo",
          },
        },
        {
          $unwind: {
            path: "$doctorInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: {
              doctorName: {
                $ifNull: ["$doctorInfo.fullName", "Unknown doctor"],
              },
              specialization: {
                $ifNull: ["$doctorInfo.specialization", "Unknown"],
              },
            },
            transactions: { $sum: 1 },
            revenue: { $sum: { $ifNull: ["$payment.amount", 0] } },
          },
        },
        { $sort: { transactions: -1 } },
        { $limit: 5 },
      ])
      .toArray(),
  ]);

  const totalRevenue = toNumber(revenueAgg?.[0]?.totalRevenue);
  const averageTransactionValue =
    completedTransactions > 0
      ? Number((totalRevenue / completedTransactions).toFixed(2))
      : 0;
  const paymentSuccessRate =
    totalTransactions > 0
      ? Number(((completedTransactions / totalTransactions) * 100).toFixed(2))
      : 0;

  return {
    dateRange: {
      key: rangeKey,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    },
    kpis: {
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      paymentFailures24h,
      completedConsultations,
      totalRevenue,
      averageTransactionValue,
      paymentSuccessRate,
    },
    charts: {
      revenueTrend: revenueTrend.map((row) => ({
        label: formatDayLabel(row._id),
        revenue: toNumber(row.revenue),
      })),
      transactionTrend: transactionTrend.map((row) => ({
        label: formatDayLabel(row._id),
        transactions: toNumber(row.transactions),
      })),
      paymentStatus: paymentStatus.map((row) => ({
        label: String(row._id || "unknown"),
        value: toNumber(row.value),
      })),
      paymentFunnel: [
        {
          label: "Created",
          value: toNumber(paymentFunnel?.[0]?.created),
        },
        {
          label: "Payment Initiated",
          value: toNumber(paymentFunnel?.[0]?.initiated),
        },
        {
          label: "Paid",
          value: toNumber(paymentFunnel?.[0]?.paid),
        },
        {
          label: "Consultation Completed",
          value: toNumber(paymentFunnel?.[0]?.completed),
        },
      ],
      specializationBreakdown: specializationBreakdown.map((row) => ({
        specialization: String(row._id || "Unknown"),
        transactions: toNumber(row.transactions),
        revenue: toNumber(row.revenue),
      })),
      transactionHeatmap: transactionHeatmap.map((row) => ({
        day: DAY_NAMES[
          Math.max(0, Math.min(6, toNumber(row._id?.dayOfWeek) - 1))
        ],
        hour: toNumber(row._id?.hour),
        transactions: toNumber(row.transactions),
      })),
      topDoctors: topDoctors.map((row) => ({
        doctorName: String(row._id?.doctorName || "Unknown doctor"),
        specialization: String(row._id?.specialization || "Unknown"),
        transactions: toNumber(row.transactions),
        revenue: toNumber(row.revenue),
      })),
    },
  };
}
