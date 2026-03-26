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

export const DOCTOR_SHARE_RATE = 0.8;
export const PLATFORM_SHARE_RATE = 0.2;

const COMPLETED_STATUS_BUCKET = "Completed";
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
          case: { $in: [normalized, ["Completed"]] },
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
      { doctor: { $in: doctorIdStrings } },
      { doctorId: { $in: doctorObjectIds } },
      { doctorId: { $in: doctorIdStrings } },
    ],
  };
}

function getCoarseRangeMatch(range: DateRange) {
  const startIso = range.start.toISOString();
  const endIso = range.end.toISOString();

  return {
    $or: [
      {
        appointmentDate: {
          $gte: range.start,
          $lte: range.end,
        },
      },
      {
        appointmentDate: {
          $gte: startIso,
          $lte: endIso,
        },
      },
      {
        updatedAt: {
          $gte: range.start,
          $lte: range.end,
        },
      },
      {
        createdAt: {
          $gte: range.start,
          $lte: range.end,
        },
      },
    ],
  };
}

function getBaseMatch(scope: DoctorScope, range: DateRange) {
  return {
    ...getDoctorMatch(scope),
    ...getCoarseRangeMatch(range),
  };
}

function buildDateNormalizeExpression(fieldName: string) {
  const fieldPath = `$${fieldName}`;

  return {
    $switch: {
      branches: [
        {
          case: { $eq: [{ $type: fieldPath }, "date"] },
          then: fieldPath,
        },
        {
          case: { $eq: [{ $type: fieldPath }, "string"] },
          then: {
            $dateFromString: {
              dateString: {
                $trim: {
                  input: fieldPath,
                },
              },
              onError: null,
              onNull: null,
            },
          },
        },
      ],
      default: null,
    },
  };
}

function buildBaseNormalizationFields() {
  const amountExpr = {
    $convert: {
      input: "$payment.amount",
      to: "double",
      onError: 0,
      onNull: 0,
    },
  };

  return {
    statusBucket: normalizeStatusExpression(),
    consultationDate: {
      $ifNull: [
        buildDateNormalizeExpression("appointmentDate"),
        buildDateNormalizeExpression("updatedAt"),
        buildDateNormalizeExpression("createdAt"),
      ],
    },
    completionDate: {
      $ifNull: [
        buildDateNormalizeExpression("payment.completedAt"),
        buildDateNormalizeExpression("appointmentDate"),
        buildDateNormalizeExpression("updatedAt"),
        buildDateNormalizeExpression("createdAt"),
      ],
    },
    grossAmount: amountExpr,
    doctorEarningAmount: {
      $cond: [
        {
          $gt: [
            {
              $convert: {
                input: "$payment.distribution.doctorAmount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
            0,
          ],
        },
        {
          $convert: {
            input: "$payment.distribution.doctorAmount",
            to: "double",
            onError: 0,
            onNull: 0,
          },
        },
        { $multiply: [amountExpr, DOCTOR_SHARE_RATE] },
      ],
    },
    platformEarningAmount: {
      $cond: [
        {
          $gt: [
            {
              $convert: {
                input: "$payment.distribution.platformAmount",
                to: "double",
                onError: 0,
                onNull: 0,
              },
            },
            0,
          ],
        },
        {
          $convert: {
            input: "$payment.distribution.platformAmount",
            to: "double",
            onError: 0,
            onNull: 0,
          },
        },
        { $multiply: [amountExpr, PLATFORM_SHARE_RATE] },
      ],
    },
    durationSeconds: {
      $convert: {
        input: "$videoSession.durationSeconds",
        to: "double",
        onError: null,
        onNull: null,
      },
    },
  };
}

export async function fetchDoctorReportsOverview(
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
        $addFields: buildBaseNormalizationFields(),
      },
      {
        $match: {
          consultationDate: {
            $gte: range.start,
            $lte: range.end,
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
                "$doctorEarningAmount",
                0,
              ],
            },
          },
          grossEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                "$grossAmount",
                0,
              ],
            },
          },
          doctorEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                "$doctorEarningAmount",
                0,
              ],
            },
          },
          platformEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$statusBucket", COMPLETED_STATUS_BUCKET] },
                "$platformEarningAmount",
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
    grossEarnings: Math.round(Number(item?.grossEarnings || 0) * 100) / 100,
    doctorEarnings: Math.round(Number(item?.doctorEarnings || 0) * 100) / 100,
    platformEarnings:
      Math.round(Number(item?.platformEarnings || 0) * 100) / 100,
    doctorShareRate: DOCTOR_SHARE_RATE,
    platformShareRate: PLATFORM_SHARE_RATE,
    avgConsultationDuration,
  };
}

export async function fetchDoctorReportsTrends(
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
        $addFields: buildBaseNormalizationFields(),
      },
      {
        $match: {
          consultationDate: {
            $gte: range.start,
            $lte: range.end,
          },
        },
      },
      {
        $addFields: {
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$consultationDate",
            },
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
            date: "$completionDate",
          },
        },
        grossEarnings: { $sum: "$grossAmount" },
        doctorEarnings: { $sum: "$doctorEarningAmount" },
        platformEarnings: { $sum: "$platformEarningAmount" },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        label: "$_id",
        grossEarnings: { $round: ["$grossEarnings", 2] },
        doctorEarnings: { $round: ["$doctorEarnings", 2] },
        platformEarnings: { $round: ["$platformEarnings", 2] },
      },
    },
  ];

  const weekPipeline = [
    {
      $group: {
        _id: {
          year: { $isoWeekYear: "$completionDate" },
          week: { $isoWeek: "$completionDate" },
        },
        grossEarnings: { $sum: "$grossAmount" },
        doctorEarnings: { $sum: "$doctorEarningAmount" },
        platformEarnings: { $sum: "$platformEarningAmount" },
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
        grossEarnings: { $round: ["$grossEarnings", 2] },
        doctorEarnings: { $round: ["$doctorEarnings", 2] },
        platformEarnings: { $round: ["$platformEarnings", 2] },
      },
    },
  ];

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $addFields: buildBaseNormalizationFields(),
      },
      {
        $match: {
          consultationDate: {
            $gte: range.start,
            $lte: range.end,
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
      grossEarnings: Number(row.grossEarnings || 0),
      doctorEarnings: Number(row.doctorEarnings || 0),
      platformEarnings: Number(row.platformEarnings || 0),
      earnings: Number(row.doctorEarnings || 0),
    })),
  };
}

export async function fetchDoctorReportsStatusDistribution(
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
        $addFields: buildBaseNormalizationFields(),
      },
      {
        $match: {
          consultationDate: {
            $gte: range.start,
            $lte: range.end,
          },
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

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: getBaseMatch(scope, range),
      },
      {
        $addFields: buildBaseNormalizationFields(),
      },
      {
        $match: {
          consultationDate: {
            $gte: range.start,
            $lte: range.end,
          },
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
        $addFields: buildBaseNormalizationFields(),
      },
      {
        $match: {
          consultationDate: {
            $gte: range.start,
            $lte: range.end,
          },
        },
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
