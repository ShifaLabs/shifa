import "server-only";

import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

export type DoctorReportsRangeKey = "7d" | "30d" | "90d";

export type DateRange = {
  key: DoctorReportsRangeKey;
  start: Date;
  end: Date;
};

type DoctorScope = {
  doctorObjectIds: ObjectId[];
  doctorIdStrings: string[];
};

const COMPLETED_STATUS_BUCKET = "completed";
const CANCELLED_STATUS_BUCKET = "cancelled";
const NO_SHOW_STATUS_BUCKET = "noShow";

function normalizeStatusExpression() {
  const normalized = {
    $toLower: {
      $trim: {
        input: { $ifNull: ["$status", ""] },
      },
    },
  };

  return {
    $switch: {
      branches: [
        {
          case: { $in: [normalized, ["completed"]] },
          then: COMPLETED_STATUS_BUCKET,
        },
        {
          case: {
            $in: [normalized, ["cancelled", "canceled", "expired"]],
          },
          then: CANCELLED_STATUS_BUCKET,
        },
        {
          case: {
            $in: [normalized, ["no-show", "noshow", "no show"]],
          },
          then: NO_SHOW_STATUS_BUCKET,
        },
      ],
      default: "other",
    },
  };
}

function toUtcDateLabel(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function getDoctorMatch({ doctorObjectIds, doctorIdStrings }: DoctorScope) {
  return {
    $or: [
      { doctor: { $in: doctorObjectIds } },
      { doctorId: { $in: doctorObjectIds } },
      { doctorId: { $in: doctorIdStrings } },
    ],
  };
}

function getRangeMatch(range: DateRange) {
  return {
    appointmentDate: {
      $gte: range.start,
      $lte: range.end,
    },
  };
}

function getBaseMatch(scope: DoctorScope, range: DateRange) {
  return {
    ...getDoctorMatch(scope),
    ...getRangeMatch(range),
  };
}

export async function fetchDoctorReportsOverview(
  scope: DoctorScope,
  range: DateRange,
) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const statusExpr = normalizeStatusExpression();

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $project: {
          statusBucket: statusExpr,
          amount: {
            $convert: {
              input: "$payment.amount",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          durationSeconds: {
            $convert: {
              input: "$videoSession.durationSeconds",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                1,
                0,
              ],
            },
          },
          cancelled: {
            $sum: {
              $cond: [
                { $eq: ["$statusBucket", CANCELLED_STATUS_BUCKET] },
                1,
                0,
              ],
            },
          },
          noShow: {
            $sum: {
              $cond: [{ $eq: ["$statusBucket", NO_SHOW_STATUS_BUCKET] }, 1, 0],
            },
          },
          totalEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                "$amount",
                0,
              ],
            },
          },
          durationSum: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                    { $gt: ["$durationSeconds", 0] },
                  ],
                },
                "$durationSeconds",
                0,
              ],
            },
          },
          durationCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                    { $gt: ["$durationSeconds", 0] },
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
    .toArray();

  const item = rows[0] || null;

  const durationCount = Number(item?.durationCount || 0);
  const avgConsultationDuration =
    durationCount > 0
      ? Math.round((Number(item?.durationSum || 0) / durationCount) * 100) / 100
      : 0;

  return {
    totalAppointments: Number(item?.totalAppointments || 0),
    completed: Number(item?.completed || 0),
    cancelled: Number(item?.cancelled || 0),
    noShow: Number(item?.noShow || 0),
    totalEarnings: Math.round(Number(item?.totalEarnings || 0) * 100) / 100,
    avgConsultationDuration,
  };
}

export async function fetchDoctorReportsTrends(
  scope: DoctorScope,
  range: DateRange,
) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const statusExpr = normalizeStatusExpression();

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $project: {
          statusBucket: statusExpr,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$appointmentDate",
            },
          },
        },
      },
      {
        $match: {
          statusBucket: {
            $in: [
              COMPLETED_STATUS_BUCKET,
              CANCELLED_STATUS_BUCKET,
              NO_SHOW_STATUS_BUCKET,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            date: "$date",
            status: "$statusBucket",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.date": 1,
        },
      },
    ])
    .toArray();

  const map = new Map<
    string,
    { completed: number; cancelled: number; noShow: number }
  >();

  for (const row of rows) {
    const date = String(row?._id?.date || "");
    if (!date) continue;

    if (!map.has(date)) {
      map.set(date, {
        completed: 0,
        cancelled: 0,
        noShow: 0,
      });
    }

    const item = map.get(date)!;
    const status = String(row?._id?.status || "");
    const count = Number(row?.count || 0);

    if (status === COMPLETED_STATUS_BUCKET) item.completed += count;
    if (status === CANCELLED_STATUS_BUCKET) item.cancelled += count;
    if (status === NO_SHOW_STATUS_BUCKET) item.noShow += count;
  }

  const items: Array<{
    date: string;
    completed: number;
    cancelled: number;
    noShow: number;
  }> = [];
  const cursor = new Date(range.start);

  while (cursor.getTime() <= range.end.getTime()) {
    const label = toUtcDateLabel(cursor);
    const value = map.get(label) || { completed: 0, cancelled: 0, noShow: 0 };
    items.push({
      date: label,
      completed: value.completed,
      cancelled: value.cancelled,
      noShow: value.noShow,
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return items;
}

export async function fetchDoctorReportsEarnings(
  scope: DoctorScope,
  range: DateRange,
) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const statusExpr = normalizeStatusExpression();

  const rangeDays =
    Math.max(
      1,
      Math.ceil(
        (range.end.getTime() - range.start.getTime()) / (24 * 60 * 60 * 1000),
      ),
    ) + 1;

  const groupBy: "day" | "week" = rangeDays > 30 ? "week" : "day";

  const dayPipeline = [
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$appointmentDate",
          },
        },
        earnings: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        label: "$_id",
        earnings: { $round: ["$earnings", 2] },
      },
    },
  ];

  const weekPipeline = [
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$appointmentDate" },
          week: { $isoWeek: "$appointmentDate" },
        },
        earnings: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
    {
      $project: {
        _id: 0,
        label: {
          $concat: [
            { $toString: "$_id.year" },
            "-W",
            {
              $cond: [
                { $lt: ["$_id.week", 10] },
                { $concat: ["0", { $toString: "$_id.week" }] },
                { $toString: "$_id.week" },
              ],
            },
          ],
        },
        earnings: { $round: ["$earnings", 2] },
      },
    },
  ];

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $project: {
          statusBucket: statusExpr,
          appointmentDate: 1,
          amount: {
            $convert: {
              input: "$payment.amount",
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $match: {
          statusBucket: COMPLETED_STATUS_BUCKET,
        },
      },
      ...(groupBy === "day" ? dayPipeline : weekPipeline),
    ])
    .toArray();

  return {
    groupBy,
    items: rows.map((row) => ({
      label: String(row.label || ""),
      earnings: Number(row.earnings || 0),
    })),
  };
}

export async function fetchDoctorReportsStatusDistribution(
  scope: DoctorScope,
  range: DateRange,
) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const statusExpr = normalizeStatusExpression();

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $project: {
          statusBucket: statusExpr,
        },
      },
      {
        $match: {
          statusBucket: {
            $in: [
              COMPLETED_STATUS_BUCKET,
              CANCELLED_STATUS_BUCKET,
              NO_SHOW_STATUS_BUCKET,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$statusBucket",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const data = {
    completed: 0,
    cancelled: 0,
    noShow: 0,
  };

  for (const row of rows) {
    const key = String(row._id || "");
    const count = Number(row.count || 0);
    if (key === COMPLETED_STATUS_BUCKET) data.completed = count;
    if (key === CANCELLED_STATUS_BUCKET) data.cancelled = count;
    if (key === NO_SHOW_STATUS_BUCKET) data.noShow = count;
  }

  const total = data.completed + data.cancelled + data.noShow;

  return {
    ...data,
    total,
    percentages: {
      completed:
        total > 0 ? Math.round((data.completed / total) * 10000) / 100 : 0,
      cancelled:
        total > 0 ? Math.round((data.cancelled / total) * 10000) / 100 : 0,
      noShow: total > 0 ? Math.round((data.noShow / total) * 10000) / 100 : 0,
    },
  };
}

export async function fetchDoctorReportsDuration(
  scope: DoctorScope,
  range: DateRange,
) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const statusExpr = normalizeStatusExpression();

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $project: {
          statusBucket: statusExpr,
          durationSeconds: {
            $convert: {
              input: "$videoSession.durationSeconds",
              to: "double",
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          statusBucket: COMPLETED_STATUS_BUCKET,
          durationSeconds: { $gt: 0 },
        },
      },
      {
        $bucket: {
          groupBy: "$durationSeconds",
          boundaries: [0, 600, 1200, 1800, 31536000],
          default: "overflow",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ])
    .toArray();

  const buckets = {
    "0-10": 0,
    "10-20": 0,
    "20-30": 0,
    "30+": 0,
  };

  for (const row of rows) {
    const boundary = Number(row?._id);
    const count = Number(row?.count || 0);

    if (boundary === 0) buckets["0-10"] = count;
    if (boundary === 600) buckets["10-20"] = count;
    if (boundary === 1200) buckets["20-30"] = count;
    if (boundary === 1800) buckets["30+"] = count;
  }

  return [
    { bucket: "0-10 min", count: buckets["0-10"] },
    { bucket: "10-20 min", count: buckets["10-20"] },
    { bucket: "20-30 min", count: buckets["20-30"] },
    { bucket: "30+ min", count: buckets["30+"] },
  ];
}

export async function fetchDoctorReportsTopPatients(
  scope: DoctorScope,
  range: DateRange,
) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $project: {
          patientKey: {
            $toString: "$patient",
          },
        },
      },
      {
        $group: {
          _id: "$patientKey",
          visits: { $sum: 1 },
        },
      },
      {
        $sort: {
          visits: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: collections.USERS,
          let: { patientId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$patientId"],
                },
              },
            },
            {
              $project: {
                _id: 0,
                fullName: 1,
                email: 1,
              },
            },
          ],
          as: "patientInfo",
        },
      },
      {
        $unwind: {
          path: "$patientInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          patientId: "$_id",
          fullName: {
            $ifNull: ["$patientInfo.fullName", "Unknown Patient"],
          },
          email: {
            $ifNull: ["$patientInfo.email", ""],
          },
          visits: 1,
        },
      },
    ])
    .toArray();

  return rows.map((row) => ({
    patientId: String(row.patientId || ""),
    fullName: String(row.fullName || "Unknown Patient"),
    email: String(row.email || ""),
    visits: Number(row.visits || 0),
  }));
}
