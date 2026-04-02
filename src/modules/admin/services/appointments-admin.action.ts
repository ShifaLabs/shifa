"use server";

import { authOptions } from "@/infrastructure/auth/auth.config";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import {
  AppointmentAction,
  AppointmentAdminAuditEntry,
  AppointmentAdminListStats,
  AppointmentListOptions,
  AppointmentPaymentStatusFilter,
  AppointmentSortBy,
  AppointmentStatusFilter,
} from "@/modules/admin/types/appointment-admin.types";

type AdminResult = {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: AppointmentAdminListStats;
};

type AdminGuardResult =
  | { ok: true; adminId: string }
  | { ok: false; error: AdminResult };

const defaultStats: AppointmentAdminListStats = {
  total: 0,
  pendingPayment: 0,
  approved: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
  expired: 0,
  paid: 0,
  unpaid: 0,
  escalated: 0,
  noShow: 0,
  refundRequired: 0,
};

async function requireAdminSession(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      error: {
        success: false,
        message: "Authentication required",
      },
    };
  }

  if (session.user.role !== "admin") {
    return {
      ok: false,
      error: {
        success: false,
        message: "Access denied",
      },
    };
  }

  return {
    ok: true,
    adminId: session.user.id,
  };
}

function serializeDoc<T>(doc: T): T {
  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      if (
        value &&
        typeof value === "object" &&
        (value._bsontype === "ObjectId" || value._bsontype === "ObjectID")
      ) {
        return value.toString();
      }

      if (value instanceof Date) {
        return value.toISOString();
      }

      return value;
    }),
  );
}

function serializeDocs<T>(docs: T[]): T[] {
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => serializeDoc(doc));
}

function resolveDateRange(range: AppointmentListOptions["dateRange"] = "all") {
  if (range === "all") return null;

  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function buildSort(sortBy?: AppointmentSortBy, sortOrder?: "asc" | "desc") {
  const order: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  if (sortBy === "createdAt") {
    return { createdAt: order, appointmentDate: -1 as 1 | -1 };
  }

  if (sortBy === "updatedAt") {
    return { updatedAt: order, appointmentDate: -1 as 1 | -1 };
  }

  if (sortBy === "patientName") {
    return { "patientInfo.fullName": order, appointmentDate: -1 as 1 | -1 };
  }

  return { appointmentDate: order, createdAt: -1 as 1 | -1 };
}

function normalizeStatusFilter(status: AppointmentStatusFilter) {
  if (status === "all") return null;
  if (status === "completed") {
    return { $in: ["completed", "complete", "Completed"] };
  }
  return status;
}

function normalizePaymentFilter(
  paymentStatus: AppointmentPaymentStatusFilter = "all",
) {
  return paymentStatus === "all" ? null : paymentStatus;
}

async function getStats(
  filter: Record<string, any>,
): Promise<AppointmentAdminListStats> {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const [
    total,
    pendingPayment,
    approved,
    confirmed,
    completed,
    cancelled,
    expired,
    paid,
    unpaid,
    escalated,
    noShow,
    refundRequired,
  ] = await Promise.all([
    appointmentsCollection.countDocuments(filter),
    appointmentsCollection.countDocuments({
      ...filter,
      status: "PendingPayment",
    }),
    appointmentsCollection.countDocuments({ ...filter, status: "Approved" }),
    appointmentsCollection.countDocuments({ ...filter, status: "Confirmed" }),
    appointmentsCollection.countDocuments({
      ...filter,
      status: { $in: ["completed", "complete", "Completed"] },
    }),
    appointmentsCollection.countDocuments({ ...filter, status: "Cancelled" }),
    appointmentsCollection.countDocuments({ ...filter, status: "Expired" }),
    appointmentsCollection.countDocuments({ ...filter, paymentStatus: "paid" }),
    appointmentsCollection.countDocuments({
      ...filter,
      paymentStatus: "unpaid",
    }),
    appointmentsCollection.countDocuments({
      ...filter,
      "adminFlags.escalated": true,
    }),
    appointmentsCollection.countDocuments({
      ...filter,
      "adminFlags.noShow": true,
    }),
    appointmentsCollection.countDocuments({
      ...filter,
      "adminFlags.refundRequired": true,
    }),
  ]);

  return {
    total,
    pendingPayment,
    approved,
    confirmed,
    completed,
    cancelled,
    expired,
    paid,
    unpaid,
    escalated,
    noShow,
    refundRequired,
  };
}

export async function getAllAppointmentsAction(
  page: number = 1,
  limit: number = 12,
  status: AppointmentStatusFilter = "all",
  options: AppointmentListOptions = {},
): Promise<AdminResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
        stats: defaultStats,
      };
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
    const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 12;
    const skip = (normalizedPage - 1) * normalizedLimit;

    const match: Record<string, any> = {};
    const statusValue = normalizeStatusFilter(status);
    if (statusValue) {
      match.status = statusValue;
    }

    const paymentStatus = normalizePaymentFilter(options.paymentStatus);
    if (paymentStatus) {
      match.paymentStatus = paymentStatus;
    }

    const rangeStart = resolveDateRange(options.dateRange || "all");
    if (rangeStart) {
      match.appointmentDate = { $gte: rangeStart };
    }

    const escaped = options.search?.trim()
      ? options.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      : "";

    const searchRegex = escaped ? new RegExp(escaped, "i") : null;
    const sort = buildSort(options.sortBy, options.sortOrder);

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
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
        $lookup: {
          from: "doctors",
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
    ];

    if (searchRegex || options.specialization) {
      const postLookupMatch: Record<string, any> = {};

      if (searchRegex) {
        postLookupMatch.$or = [
          { appointmentId: searchRegex },
          { "patientInfo.fullName": searchRegex },
          { "patientInfo.email": searchRegex },
          { "doctorInfo.fullName": searchRegex },
          { "doctorInfo.email": searchRegex },
        ];
      }

      if (options.specialization && options.specialization !== "all") {
        postLookupMatch["doctorInfo.specialization"] = options.specialization;
      }

      pipeline.push({ $match: postLookupMatch });
    }

    const [rows, total, stats] = await Promise.all([
      appointmentsCollection
        .aggregate([
          ...pipeline,
          {
            $project: {
              _id: 1,
              appointmentId: 1,
              appointmentDate: 1,
              createdAt: 1,
              updatedAt: 1,
              status: 1,
              paymentStatus: 1,
              consultationType: 1,
              symptoms: 1,
              payment: 1,
              adminFlags: 1,
              patient: {
                _id: "$patientInfo._id",
                fullName: "$patientInfo.fullName",
                email: "$patientInfo.email",
                phone: "$patientInfo.phone",
                isBanned: "$patientInfo.isBanned",
                status: "$patientInfo.status",
              },
              doctor: {
                _id: "$doctorInfo._id",
                fullName: "$doctorInfo.fullName",
                email: "$doctorInfo.email",
                specialization: "$doctorInfo.specialization",
                isBanned: "$doctorInfo.isBanned",
                status: "$doctorInfo.status",
              },
            },
          },
          { $sort: sort },
          { $skip: skip },
          { $limit: normalizedLimit },
        ])
        .toArray(),
      appointmentsCollection
        .aggregate([...pipeline, { $count: "total" }])
        .toArray(),
      getStats(match),
    ]);

    const totalCount = total[0]?.total || 0;

    return {
      success: true,
      message: "Appointments loaded",
      data: serializeDocs(rows),
      stats,
      pagination: {
        page: normalizedPage,
        limit: normalizedLimit,
        total: totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / normalizedLimit)),
      },
    };
  } catch (error) {
    console.error("Error fetching admin appointments:", error);
    return {
      success: false,
      message: "Failed to fetch appointments",
      data: [],
      stats: defaultStats,
    };
  }
}

async function appendAdminAuditTrail({
  appointmentId,
  from,
  to,
  action,
  reason,
  adminId,
  metadata,
}: {
  appointmentId: ObjectId;
  from?: string | null;
  to?: string | null;
  action: string;
  reason?: string;
  adminId: string;
  metadata?: Record<string, unknown>;
}) {
  const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);

  await auditCollection.insertOne({
    entityType: "appointment",
    entityId: appointmentId,
    action,
    reason: reason || null,
    metadata: {
      ...(metadata || {}),
      from,
      to,
    },
    actorId: adminId,
    createdAt: new Date(),
  });
}

async function applyAppointmentAction({
  appointmentId,
  action,
  reason,
  adminId,
}: {
  appointmentId: string;
  action: AppointmentAction;
  reason: string;
  adminId: string;
}): Promise<AdminResult> {
  if (!ObjectId.isValid(appointmentId)) {
    return {
      success: false,
      message: "Invalid appointment ID",
    };
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const objectId = new ObjectId(appointmentId);
  const appointment = await appointmentsCollection.findOne({ _id: objectId });

  if (!appointment) {
    return {
      success: false,
      message: "Appointment not found",
    };
  }

  const now = new Date();
  const currentStatus = appointment.status || null;
  const trimmedReason = reason.trim() || "Updated by admin";

  const setPayload: Record<string, any> = {
    updatedAt: now,
    "adminFlags.lastIntervenedAt": now,
    "adminFlags.lastIntervenedBy": adminId,
    "adminFlags.lastInterventionReason": trimmedReason,
  };

  let nextStatus = currentStatus;
  let actionLabel = "appointment.admin.updated";

  if (action === "escalate") {
    setPayload["adminFlags.escalated"] = true;
    setPayload["adminFlags.disputed"] = true;
    actionLabel = "appointment.admin.escalate";
  }

  if (action === "markNoShow") {
    setPayload["adminFlags.noShow"] = true;
    setPayload.status = "Cancelled";
    nextStatus = "Cancelled";
    actionLabel = "appointment.admin.no-show";
  }

  if (action === "cancel") {
    setPayload.status = "Cancelled";
    nextStatus = "Cancelled";
    actionLabel = "appointment.admin.cancel";

    if (
      appointment.paymentStatus === "paid" ||
      appointment?.payment?.status === "completed"
    ) {
      setPayload["adminFlags.refundRequired"] = true;
    }
  }

  if (action === "markRefundRequired") {
    setPayload["adminFlags.refundRequired"] = true;
    actionLabel = "appointment.admin.refund-required";
  }

  await appointmentsCollection.updateOne(
    { _id: objectId },
    {
      $set: setPayload,
      $push: {
        auditTrail: {
          action: `Admin ${action}`,
          performedBy: "Admin",
          from: currentStatus,
          to: nextStatus,
          reason: trimmedReason,
          actorId: adminId,
          at: now,
        },
      } as any,
    },
  );

  await appendAdminAuditTrail({
    appointmentId: objectId,
    from: currentStatus,
    to: nextStatus,
    action: actionLabel,
    reason: trimmedReason,
    adminId,
  });

  return {
    success: true,
    message: "Appointment updated successfully",
  };
}

export async function runAppointmentAction(
  appointmentId: string,
  action: AppointmentAction,
  reason: string,
): Promise<AdminResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    if (!reason?.trim()) {
      return {
        success: false,
        message: "Reason is required for this action",
      };
    }

    return applyAppointmentAction({
      appointmentId,
      action,
      reason,
      adminId: auth.adminId,
    });
  } catch (error) {
    console.error("Error applying appointment action:", error);
    return {
      success: false,
      message: "Failed to apply action",
    };
  }
}

export async function runBulkAppointmentAction(
  appointmentIds: string[],
  action: AppointmentAction,
  reason: string,
) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        results: [],
      };
    }

    const uniqueIds = Array.from(new Set(appointmentIds)).filter((id) =>
      ObjectId.isValid(id),
    );

    if (uniqueIds.length === 0) {
      return {
        success: false,
        message: "No valid appointment IDs provided",
        results: [],
      };
    }

    const results: Array<{ id: string; success: boolean; message: string }> =
      [];

    for (const id of uniqueIds) {
      const result = await applyAppointmentAction({
        appointmentId: id,
        action,
        reason,
        adminId: auth.adminId,
      });

      results.push({
        id,
        success: result.success,
        message: result.message,
      });
    }

    const successCount = results.filter((result) => result.success).length;

    return {
      success: successCount > 0,
      message: `${successCount} of ${results.length} appointments updated.`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
      },
    };
  } catch (error) {
    console.error("Error in bulk appointment action:", error);
    return {
      success: false,
      message: "Failed to process bulk action",
      results: [],
    };
  }
}

export async function getAppointmentAuditTrailAction(
  appointmentId: string,
  limit: number = 30,
) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
      };
    }

    if (!ObjectId.isValid(appointmentId)) {
      return {
        success: false,
        message: "Invalid appointment ID",
        data: [],
      };
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
    const doc = await appointmentsCollection.findOne(
      { _id: new ObjectId(appointmentId) },
      {
        projection: {
          auditTrail: 1,
        },
      },
    );

    const trail = Array.isArray(doc?.auditTrail)
      ? doc.auditTrail.slice(-Math.max(1, limit)).reverse()
      : [];

    return {
      success: true,
      data: serializeDocs(trail) as unknown as AppointmentAdminAuditEntry[],
    };
  } catch (error) {
    console.error("Error fetching appointment audit trail:", error);
    return {
      success: false,
      message: "Failed to fetch appointment audit trail",
      data: [],
    };
  }
}

export async function cascadeCancelFutureAppointmentsForActor({
  actorType,
  actorId,
  adminId,
  reason,
}: {
  actorType: "doctor" | "patient";
  actorId: string;
  adminId: string;
  reason: string;
}) {
  try {
    if (!ObjectId.isValid(actorId)) {
      return {
        success: false,
        message: "Invalid actor ID",
        summary: { scanned: 0, cancelled: 0, refundRequired: 0 },
      };
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
    const actorObjectId = new ObjectId(actorId);
    const now = new Date();

    const filter = {
      [actorType]: actorObjectId,
      appointmentDate: { $gte: now },
      status: { $in: ["PendingPayment", "Approved", "Confirmed"] },
    };

    const candidates = await appointmentsCollection
      .find(filter, {
        projection: {
          _id: 1,
          status: 1,
          paymentStatus: 1,
          payment: 1,
        },
      })
      .toArray();

    if (!candidates.length) {
      return {
        success: true,
        message: "No future appointments to cascade-cancel.",
        summary: { scanned: 0, cancelled: 0, refundRequired: 0 },
      };
    }

    let refundRequired = 0;

    for (const appointment of candidates) {
      const needsRefund =
        appointment.paymentStatus === "paid" ||
        appointment?.payment?.status === "completed";

      if (needsRefund) {
        refundRequired += 1;
      }

      await appointmentsCollection.updateOne(
        { _id: appointment._id },
        {
          $set: {
            status: "Cancelled",
            updatedAt: now,
            "adminFlags.refundRequired": needsRefund,
            "adminFlags.escalated": true,
            "adminFlags.lastIntervenedAt": now,
            "adminFlags.lastIntervenedBy": adminId,
            "adminFlags.lastInterventionReason": reason,
          },
          $push: {
            auditTrail: {
              action: "System Cascaded Cancel",
              performedBy: "System",
              from: appointment.status || null,
              to: "Cancelled",
              reason,
              actorId: adminId,
              at: now,
            },
          } as any,
        },
      );

      await appendAdminAuditTrail({
        appointmentId: appointment._id,
        from: appointment.status || null,
        to: "Cancelled",
        action: `appointment.cascade-cancel.${actorType}`,
        reason,
        adminId,
      });
    }

    return {
      success: true,
      message: `${candidates.length} future appointments cancelled due to moderation.`,
      summary: {
        scanned: candidates.length,
        cancelled: candidates.length,
        refundRequired,
      },
    };
  } catch (error) {
    console.error("Error in cascade cancellation:", error);
    return {
      success: false,
      message: "Failed to cascade-cancel appointments",
      summary: { scanned: 0, cancelled: 0, refundRequired: 0 },
    };
  }
}
