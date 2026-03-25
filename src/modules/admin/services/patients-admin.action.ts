"use server";

import { authOptions } from "@/infrastructure/auth/auth.config";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import {
  AdminAuditEntry,
  JoinedRange,
  ModerationAction,
  ModerationFilter,
  PatientAdminListStats,
  PatientAdminRecord,
  PatientListOptions,
  PatientSortBy,
  PatientStatusFilter,
  SuspensionMode,
  TrustLevel,
} from "@/modules/admin/types/patient-admin.types";

type AdminResult = {
  success: boolean;
  message: string;
  data?: any;
};

type AdminGuardResult =
  | { ok: true; adminId: string }
  | { ok: false; error: AdminResult };

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

function buildSort(sortBy?: PatientSortBy, sortOrder?: "asc" | "desc") {
  const order: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  if (sortBy === "fullName") {
    return { fullName: order, createdAt: -1 as 1 | -1 };
  }

  if (sortBy === "updatedAt") {
    return { updatedAt: order, createdAt: -1 as 1 | -1 };
  }

  return { createdAt: order };
}

function resolveJoinedRange(range: JoinedRange = "all") {
  if (range === "all") return null;

  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function computeRisk(record: {
  status?: string;
  isVerified?: boolean;
  profileCompleted?: boolean;
  moderation?: { state?: string; until?: string | null };
  activity: {
    totalAppointments: number;
    completedAppointments: number;
    approvedAppointments: number;
    lastAppointmentAt: string | null;
  };
}) {
  let score = 10;
  const reasons: string[] = [];

  if (!record.isVerified) {
    score += 20;
    reasons.push("Unverified account");
  }

  if (!record.profileCompleted) {
    score += 15;
    reasons.push("Incomplete profile");
  }

  if (record.status === "inactive") {
    score += 20;
    reasons.push("Account inactive");
  }

  if (record.moderation?.state === "suspended") {
    score += 35;
    reasons.push("Account suspended by admin");
  }

  if (record.moderation?.state === "banned") {
    score += 50;
    reasons.push("Account banned by admin");
  }

  if (record.activity.totalAppointments === 0) {
    score += 8;
    reasons.push("No appointment history");
  }

  if (record.activity.lastAppointmentAt) {
    const last = new Date(record.activity.lastAppointmentAt).getTime();
    const staleDays = (Date.now() - last) / (24 * 60 * 60 * 1000);
    if (staleDays > 120) {
      score += 12;
      reasons.push("Long inactivity");
    }
  }

  const bounded = Math.max(0, Math.min(100, score));
  const level: TrustLevel =
    bounded >= 70 ? "high" : bounded >= 40 ? "medium" : "low";

  return {
    score: bounded,
    level,
    reasons,
  };
}

async function logPatientAdminAction({
  adminId,
  patientId,
  action,
  reason,
  metadata,
}: {
  adminId: string;
  patientId: ObjectId;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);

  await auditCollection.insertOne({
    entityType: "patient",
    entityId: patientId,
    action,
    reason: reason || null,
    metadata: metadata || {},
    actorId: adminId,
    createdAt: new Date(),
  });
}

export async function getAllPatientsAction(
  page: number = 1,
  limit: number = 12,
  status: PatientStatusFilter = "all",
  options: PatientListOptions = {},
) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
        stats: {
          total: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          banned: 0,
          unverified: 0,
        },
      };
    }

    const usersCollection = await dbConnect(collections.USERS);
    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
    const skip = (page - 1) * limit;

    const filter: any = {
      role: "patient",
    };

    if (status !== "all") {
      filter.status = status;
    }

    const moderationState = options.moderationState || "all";
    if (moderationState !== "all") {
      if (moderationState === "none") {
        filter.$or = [
          { "moderation.state": { $exists: false } },
          { "moderation.state": "none" },
        ];
      } else {
        filter["moderation.state"] = moderationState;
      }
    }

    if (options.search?.trim()) {
      const escaped = options.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      const existingOr = Array.isArray(filter.$or) ? filter.$or : [];
      filter.$or = [
        ...existingOr,
        { fullName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const joinedFrom = resolveJoinedRange(options.joinedRange || "all");
    if (joinedFrom) {
      filter.createdAt = { $gte: joinedFrom };
    }

    const [
      rawPatients,
      total,
      active,
      inactive,
      suspended,
      banned,
      unverified,
    ] = await Promise.all([
      usersCollection
        .find(filter, {
          projection: {
            password: 0,
          },
        })
        .sort(buildSort(options.sortBy, options.sortOrder))
        .skip(skip)
        .limit(limit)
        .toArray(),
      usersCollection.countDocuments(filter),
      usersCollection.countDocuments({ ...filter, status: "active" }),
      usersCollection.countDocuments({ ...filter, status: "inactive" }),
      usersCollection.countDocuments({
        ...filter,
        "moderation.state": "suspended",
      }),
      usersCollection.countDocuments({
        ...filter,
        "moderation.state": "banned",
      }),
      usersCollection.countDocuments({ ...filter, isVerified: { $ne: true } }),
    ]);

    const patientIds = rawPatients
      .map((patient) => patient._id)
      .filter((id): id is ObjectId => ObjectId.isValid(id));

    const activityRows =
      patientIds.length > 0
        ? await appointmentsCollection
            .aggregate([
              {
                $match: {
                  patient: { $in: patientIds },
                },
              },
              {
                $group: {
                  _id: "$patient",
                  totalAppointments: { $sum: 1 },
                  completedAppointments: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "Completed"] }, 1, 0],
                    },
                  },
                  approvedAppointments: {
                    $sum: {
                      $cond: [{ $eq: ["$status", "Approved"] }, 1, 0],
                    },
                  },
                  lastAppointmentAt: { $max: "$appointmentDate" },
                },
              },
            ])
            .toArray()
        : [];

    const activityMap = new Map<string, any>();
    for (const row of activityRows) {
      activityMap.set(String(row._id), row);
    }

    const enrichedPatients = rawPatients
      .map((patient) => {
        const basePatient = serializeDoc(patient) as unknown as Omit<
          PatientAdminRecord,
          "activity" | "risk"
        >;
        const activity = activityMap.get(String(patient._id)) || {
          totalAppointments: 0,
          completedAppointments: 0,
          approvedAppointments: 0,
          lastAppointmentAt: null,
        };

        const record: PatientAdminRecord = {
          ...basePatient,
          activity: {
            totalAppointments: activity.totalAppointments || 0,
            completedAppointments: activity.completedAppointments || 0,
            approvedAppointments: activity.approvedAppointments || 0,
            lastAppointmentAt: activity.lastAppointmentAt
              ? new Date(activity.lastAppointmentAt).toISOString()
              : null,
          },
          risk: { score: 0, level: "low", reasons: [] },
        };

        record.risk = computeRisk(record);

        return record;
      })
      .filter((patient) => {
        if (!options.trustLevel || options.trustLevel === "all") return true;
        return patient.risk.level === options.trustLevel;
      });

    const stats: PatientAdminListStats = {
      total,
      active,
      inactive,
      suspended,
      banned,
      unverified,
    };

    return {
      success: true,
      data: serializeDocs(enrichedPatients),
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return {
      success: false,
      message: "Failed to fetch patients",
      data: [],
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        banned: 0,
        unverified: 0,
      },
    };
  }
}

async function applyPatientModerationAction({
  adminId,
  patientId,
  action,
  reason,
  mode,
  durationDays,
}: {
  adminId: string;
  patientId: string;
  action: ModerationAction;
  reason: string;
  mode?: SuspensionMode;
  durationDays?: number;
}): Promise<AdminResult> {
  if (!ObjectId.isValid(patientId)) {
    return {
      success: false,
      message: "Invalid patient ID",
    };
  }

  const usersCollection = await dbConnect(collections.USERS);
  const patientObjectId = new ObjectId(patientId);
  const patient = await usersCollection.findOne({
    _id: patientObjectId,
    role: "patient",
  });

  if (!patient) {
    return {
      success: false,
      message: "Patient not found",
    };
  }

  const now = new Date();
  const cleanReason = reason.trim() || "No reason provided";
  const modeValue: SuspensionMode = mode || "open-ended";
  const validDuration =
    typeof durationDays === "number" && durationDays > 0 && durationDays <= 365
      ? durationDays
      : null;

  const untilDate =
    action === "suspend" && modeValue === "duration" && validDuration
      ? new Date(now.getTime() + validDuration * 24 * 60 * 60 * 1000)
      : null;

  const moderationState =
    action === "reactivate"
      ? "none"
      : action === "suspend"
        ? "suspended"
        : "banned";

  const nextStatus = action === "reactivate" ? "active" : "inactive";

  await usersCollection.updateOne(
    {
      _id: patientObjectId,
      role: "patient",
    },
    {
      $set: {
        status: nextStatus,
        isBanned: action === "ban",
        moderation: {
          state: moderationState,
          reason: action === "reactivate" ? null : cleanReason,
          until: action === "suspend" ? untilDate : null,
          updatedAt: now,
          updatedBy: adminId,
        },
        updatedAt: now,
      },
    },
  );

  await logPatientAdminAction({
    adminId,
    patientId: patientObjectId,
    action: `patient.${action}`,
    reason: cleanReason,
    metadata: {
      mode: action === "suspend" ? modeValue : null,
      durationDays: action === "suspend" ? validDuration : null,
      until: untilDate,
      previousStatus: patient.status || "unknown",
      previousModerationState: patient?.moderation?.state || "none",
      nextStatus,
      nextModerationState: moderationState,
    },
  });

  const updatedPatient = await usersCollection.findOne({
    _id: patientObjectId,
  });

  return {
    success: true,
    message:
      action === "reactivate"
        ? `Patient ${patient.fullName || patient.email} has been reactivated.`
        : action === "suspend"
          ? `Patient ${patient.fullName || patient.email} has been suspended.`
          : `Patient ${patient.fullName || patient.email} has been banned.`,
    data: serializeDoc(updatedPatient),
  };
}

export async function moderatePatientAction(
  patientId: string,
  action: ModerationAction,
  reason: string,
  mode?: SuspensionMode,
  durationDays?: number,
): Promise<AdminResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    if (!reason?.trim() && action !== "reactivate") {
      return {
        success: false,
        message: "Reason is required for this action",
      };
    }

    return applyPatientModerationAction({
      adminId: auth.adminId,
      patientId,
      action,
      reason: reason || "Reactivated by admin",
      mode,
      durationDays,
    });
  } catch (error) {
    console.error("Error moderating patient:", error);
    return {
      success: false,
      message: "Failed to process patient moderation action",
    };
  }
}

export async function bulkModeratePatientsAction(
  patientIds: string[],
  action: ModerationAction,
  reason: string,
  mode?: SuspensionMode,
  durationDays?: number,
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

    const uniqueIds = Array.from(new Set(patientIds)).filter((id) =>
      ObjectId.isValid(id),
    );

    if (uniqueIds.length === 0) {
      return {
        success: false,
        message: "No valid patient IDs provided",
        results: [],
      };
    }

    const results: Array<{
      patientId: string;
      success: boolean;
      message: string;
    }> = [];

    for (const patientId of uniqueIds) {
      const result = await applyPatientModerationAction({
        adminId: auth.adminId,
        patientId,
        action,
        reason,
        mode,
        durationDays,
      });

      results.push({
        patientId,
        success: result.success,
        message: result.message,
      });
    }

    const successCount = results.filter((result) => result.success).length;

    return {
      success: successCount > 0,
      message: `${successCount} of ${results.length} patients updated.`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
      },
    };
  } catch (error) {
    console.error("Error in bulk patient moderation:", error);
    return {
      success: false,
      message: "Failed to process bulk patient moderation",
      results: [],
    };
  }
}

export async function getPatientAuditTrailAction(
  patientId: string,
  limit: number = 20,
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

    if (!ObjectId.isValid(patientId)) {
      return {
        success: false,
        message: "Invalid patient ID",
        data: [],
      };
    }

    const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;

    const entries = await auditCollection
      .find({
        entityType: "patient",
        entityId: new ObjectId(patientId),
      })
      .sort({ createdAt: -1 })
      .limit(normalizedLimit)
      .toArray();

    return {
      success: true,
      data: serializeDocs(entries) as unknown as AdminAuditEntry[],
    };
  } catch (error) {
    console.error("Error fetching patient audit trail:", error);
    return {
      success: false,
      message: "Failed to fetch patient audit trail",
      data: [],
    };
  }
}
