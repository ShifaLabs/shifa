"use server";

import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getAdminOverviewAnalytics } from "@/modules/admin/analytics/analytics.service";
import { moderatePatientAction } from "@/modules/admin/services/patients-admin.action";
import { moderateDoctorAction } from "@/modules/auth/doctor-approval.action";
import {
  ReportsActorType,
  ReportsDashboardData,
  ReportsDashboardResult,
  ReportsModerationAction,
  ReportsRangeKey,
} from "@/modules/admin/types/reports-admin.types";

type AdminGuardResult =
  | { ok: true; adminId: string }
  | { ok: false; error: ReportsDashboardResult };

function normalizeRange(value?: string): ReportsRangeKey {
  if (value === "24h" || value === "7d" || value === "30d" || value === "mtd") {
    return value;
  }
  return "mtd";
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

export async function getAdminReportsDashboardAction(
  requestedRange?: string,
): Promise<ReportsDashboardResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const range = normalizeRange(requestedRange);

    const usersCollection = await dbConnect(collections.USERS);
    const doctorsCollection = await dbConnect(collections.DOCTORS);

    const [analytics, moderationSummaryRaw, patientQueueRaw, doctorQueueRaw] =
      await Promise.all([
        getAdminOverviewAnalytics(range),
        Promise.all([
          usersCollection.countDocuments({
            role: "patient",
            "moderation.state": "suspended",
          }),
          usersCollection.countDocuments({
            role: "patient",
            "moderation.state": "banned",
          }),
          doctorsCollection.countDocuments({ "moderation.state": "suspended" }),
          doctorsCollection.countDocuments({ "moderation.state": "banned" }),
          doctorsCollection.countDocuments({ approvalStatus: "pending" }),
        ]),
        usersCollection
          .find(
            {
              role: "patient",
              $or: [
                { "moderation.state": "suspended" },
                { "moderation.state": "banned" },
              ],
            },
            {
              projection: {
                _id: 1,
                fullName: 1,
                email: 1,
                status: 1,
                moderation: 1,
                updatedAt: 1,
              },
            },
          )
          .sort({ "moderation.updatedAt": -1, updatedAt: -1 })
          .limit(6)
          .toArray(),
        doctorsCollection
          .find(
            {
              $or: [
                { "moderation.state": "suspended" },
                { "moderation.state": "banned" },
              ],
            },
            {
              projection: {
                _id: 1,
                fullName: 1,
                email: 1,
                specialization: 1,
                status: 1,
                moderation: 1,
                updatedAt: 1,
              },
            },
          )
          .sort({ "moderation.updatedAt": -1, updatedAt: -1 })
          .limit(6)
          .toArray(),
      ]);

    const [
      patientsSuspended,
      patientsBanned,
      doctorsSuspended,
      doctorsBanned,
      doctorsPendingApproval,
    ] = moderationSummaryRaw;

    const data: ReportsDashboardData = {
      dateRange: {
        key: range,
        startDate: analytics.dateRange.startDate,
        endDate: analytics.dateRange.endDate,
      },
      kpis: analytics.kpis,
      charts: analytics.charts,
      moderationSummary: {
        patientsSuspended,
        patientsBanned,
        doctorsSuspended,
        doctorsBanned,
        doctorsPendingApproval,
      },
      queues: {
        patients: patientQueueRaw.map((row: any) => ({
          _id: String(row._id),
          fullName: row.fullName || "Unnamed patient",
          email: row.email || "No email",
          status: row.status || "unknown",
          moderationState: row?.moderation?.state || "none",
          moderationReason: row?.moderation?.reason || null,
          updatedAt:
            row?.moderation?.updatedAt?.toISOString?.() ||
            row?.updatedAt?.toISOString?.() ||
            null,
        })),
        doctors: doctorQueueRaw.map((row: any) => ({
          _id: String(row._id),
          fullName: row.fullName || "Unknown doctor",
          email: row.email || "No email",
          specialization: row.specialization || "Unknown",
          status: row.status || "unknown",
          moderationState: row?.moderation?.state || "none",
          moderationReason: row?.moderation?.reason || null,
          updatedAt:
            row?.moderation?.updatedAt?.toISOString?.() ||
            row?.updatedAt?.toISOString?.() ||
            null,
        })),
      },
    };

    return {
      success: true,
      message: "Admin reports dashboard loaded",
      data: serializeDoc(data),
    };
  } catch (error) {
    console.error("Failed to load reports dashboard:", error);
    return {
      success: false,
      message: "Failed to load reports dashboard",
    };
  }
}

export async function runReportsModerationAction(input: {
  actorType: ReportsActorType;
  actorId: string;
  action: ReportsModerationAction;
  reason: string;
  durationDays?: number;
}) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    if (!ObjectId.isValid(input.actorId)) {
      return {
        success: false,
        message: "Invalid actor ID",
      };
    }

    if (!input.reason.trim() && input.action !== "reactivate") {
      return {
        success: false,
        message: "Reason is required for this action",
      };
    }

    if (input.actorType === "patient") {
      return moderatePatientAction(
        input.actorId,
        input.action,
        input.reason || "Reactivated by admin",
        input.action === "suspend" ? "duration" : undefined,
        input.action === "suspend"
          ? Number(input.durationDays || 0)
          : undefined,
      );
    }

    return moderateDoctorAction(
      input.actorId,
      input.action,
      input.reason || "Reactivated by admin",
      input.action === "suspend" ? Number(input.durationDays || 0) : undefined,
    );
  } catch (error) {
    console.error("Failed to run reports moderation action:", error);
    return {
      success: false,
      message: "Failed to run moderation action",
    };
  }
}
