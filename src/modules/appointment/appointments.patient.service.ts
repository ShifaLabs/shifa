import "server-only";

import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

const AUTO_EXPIRE_MINUTES = 15;
const VISIBLE_DASHBOARD_STATUSES = [
  "PendingPayment",
  "scheduled",
  "Confirmed",
  "confirmed",
  "in-progress",
  "Approved",
  "Completed",
  "completed",
  "Cancelled",
  "cancelled",
  "no-show",
  "Expired",
];

type AppointmentTab = "upcoming" | "completed" | "cancelled" | "no-show";

type GetPatientAppointmentsOptions = {
  tab?: AppointmentTab;
  limit?: number;
};

type AppointmentCountSummary = {
  upcoming: number;
  completed: number;
  cancelled: number;
  "no-show": number;
  total: number;
};

const TAB_STATUS_MAP: Record<AppointmentTab, string[]> = {
  upcoming: [
    "PendingPayment",
    "scheduled",
    "Approved",
    "Confirmed",
    "confirmed",
    "in-progress",
  ],
  completed: ["Completed", "completed"],
  cancelled: ["Cancelled", "cancelled", "Expired"],
  "no-show": ["no-show"],
};

function getThresholdDate(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function resolveStatusesForTab(tab?: AppointmentTab) {
  if (!tab) {
    return VISIBLE_DASHBOARD_STATUSES;
  }

  return TAB_STATUS_MAP[tab] || VISIBLE_DASHBOARD_STATUSES;
}

function resolveSortForTab(tab?: AppointmentTab) {
  if (tab === "upcoming") {
    return { appointmentDate: 1 };
  }

  return { appointmentDate: -1 };
}

export async function expirePendingAppointmentsForPatient(patientId: string) {
  if (!ObjectId.isValid(patientId)) {
    throw new Error("Invalid patient id");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const now = new Date();
  const expireBefore = getThresholdDate(AUTO_EXPIRE_MINUTES);
  const expireUpdatePayload: any = {
    $set: {
      status: "Expired",
      updatedAt: now,
    },
    $push: {
      auditTrail: {
        action: "Auto Expired",
        performedBy: "System",
        from: "PendingPayment",
        to: "Expired",
        at: now,
      },
    },
  };

  await appointmentsCollection.updateMany(
    {
      patient: new ObjectId(patientId),
      status: "PendingPayment",
      paymentStatus: "unpaid",
      createdAt: { $lte: expireBefore },
    },
    expireUpdatePayload,
  );
}

export async function getPatientAppointmentsForDashboard(
  patientId: string,
  options: GetPatientAppointmentsOptions = {},
) {
  if (!ObjectId.isValid(patientId)) {
    throw new Error("Invalid patient id");
  }

  const statuses = resolveStatusesForTab(options.tab);
  const sort = resolveSortForTab(options.tab);
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const pipeline: any[] = [
    {
      $match: {
        patient: new ObjectId(patientId),
        status: { $in: statuses },
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    {
      $unwind: "$doctorInfo",
    },
    {
      $project: {
        _id: 1,
        appointmentId: 1,
        appointmentDate: 1,
        status: 1,
        paymentStatus: 1,
        payment: 1,
        consultationType: 1,
        symptoms: 1,
        meetingLink: 1,
        videoSession: 1,
        doctorName: "$doctorInfo.fullName",
        specialization: "$doctorInfo.specialization",
      },
    },
    {
      $sort: sort,
    },
  ];

  if (options.limit && options.limit > 0) {
    pipeline.push({ $limit: options.limit });
  }

  const appointments = await appointmentsCollection
    .aggregate(pipeline)
    .toArray();

  return serialize(appointments);
}

export async function getPatientAppointmentCountsForDashboard(
  patientId: string,
): Promise<AppointmentCountSummary> {
  if (!ObjectId.isValid(patientId)) {
    throw new Error("Invalid patient id");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: {
          patient: new ObjectId(patientId),
          status: { $in: VISIBLE_DASHBOARD_STATUSES },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const statusCounts = rows.reduce(
    (acc: Record<string, number>, item: { _id: string; count: number }) => {
      acc[item._id] = item.count;
      return acc;
    },
    {},
  );

  const countByTab = (tab: AppointmentTab) => {
    return TAB_STATUS_MAP[tab].reduce((sum, status) => {
      return sum + (statusCounts[status] || 0);
    }, 0);
  };

  const summary: AppointmentCountSummary = {
    upcoming: countByTab("upcoming"),
    completed: countByTab("completed"),
    cancelled: countByTab("cancelled"),
    "no-show": countByTab("no-show"),
    total: 0,
  };

  summary.total =
    summary.upcoming +
    summary.completed +
    summary.cancelled +
    summary["no-show"];

  return summary;
}

export async function getPatientAppointmentDetails(
  patientId: string,
  appointmentId: string,
) {
  if (!ObjectId.isValid(patientId) || !ObjectId.isValid(appointmentId)) {
    throw new Error("Invalid appointment or patient id");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const result = await appointmentsCollection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(appointmentId),
          patient: new ObjectId(patientId),
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
    ])
    .toArray();

  return serialize(result[0] || null);
}
