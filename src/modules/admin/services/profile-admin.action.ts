"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { moderatePatientAction } from "@/modules/admin/services/patients-admin.action";
import { moderateDoctorAction } from "@/modules/auth/doctor-approval.action";
import {
  AdminActionResult,
  AdminProfileData,
  AdminProfileUpdatePayload,
  AdminQuickModerationPayload,
  AdminSecurityEvent,
  AdminSessionItem,
} from "@/modules/admin/types/profile-admin.types";

type AdminGuardResult =
  | { ok: true; adminId: string }
  | { ok: false; error: AdminActionResult };

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9()\-\s]{7,20}$/)
    .nullable(),
  profileImage: z
    .string()
    .trim()
    .url("Profile image must be a valid URL")
    .nullable(),
  timezone: z.string().trim().min(2).max(64),
  notifications: z.object({
    productUpdates: z.boolean(),
    securityAlerts: z.boolean(),
    moderationDigest: z.boolean(),
  }),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).max(128),
});

const toggleMfaSchema = z.object({
  currentPassword: z.string().min(6),
  enabled: z.boolean(),
});

const quickModerationSchema = z.object({
  actorType: z.enum(["patient", "doctor"]),
  targetEmail: z.string().trim().email(),
  action: z.enum(["suspend", "ban", "reactivate"]),
  reason: z.string().trim().max(400),
  durationDays: z.number().int().min(1).max(365).optional(),
});

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

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
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

async function logAdminProfileAction(input: {
  adminId: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);

  await auditCollection.insertOne({
    entityType: "admin",
    entityId: new ObjectId(input.adminId),
    action: input.action,
    reason: input.reason || null,
    metadata: input.metadata || {},
    actorId: input.adminId,
    createdAt: new Date(),
  });
}

function toAdminProfileData(
  admin: any,
  stats: AdminProfileData["stats"],
): AdminProfileData {
  return {
    _id: String(admin._id),
    fullName: admin.fullName || "Admin",
    email: admin.email || "",
    phone: admin.phone || null,
    profileImage: admin.profileImage || null,
    timezone: admin?.preferences?.timezone || "Asia/Dhaka",
    role: "admin",
    status: admin.status || "active",
    moderationState: admin?.moderation?.state || "none",
    createdAt: admin?.createdAt?.toISOString?.() || null,
    updatedAt: admin?.updatedAt?.toISOString?.() || null,
    profileCompleted: Boolean(admin.profileCompleted),
    mfaEnabled: Boolean(admin?.security?.mfaEnabled),
    notifications: {
      productUpdates: Boolean(
        admin?.preferences?.notifications?.productUpdates,
      ),
      securityAlerts:
        admin?.preferences?.notifications?.securityAlerts !== false,
      moderationDigest: Boolean(
        admin?.preferences?.notifications?.moderationDigest,
      ),
    },
    stats,
  };
}

export async function getAdminProfileAction(): Promise<
  AdminActionResult<AdminProfileData>
> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const usersCollection = await dbConnect(collections.USERS);
    const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);

    const [admin, totalActions, actionsLast24h, actionsLast7d] =
      await Promise.all([
        usersCollection.findOne(
          {
            _id: new ObjectId(auth.adminId),
            role: "admin",
          },
          {
            projection: {
              password: 0,
              resetPasswordToken: 0,
              resetPasswordExpires: 0,
            },
          },
        ),
        auditCollection.countDocuments({ actorId: auth.adminId }),
        auditCollection.countDocuments({
          actorId: auth.adminId,
          createdAt: {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        }),
        auditCollection.countDocuments({
          actorId: auth.adminId,
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

    if (!admin) {
      return {
        success: false,
        message: "Admin profile not found",
      };
    }

    return {
      success: true,
      message: "Admin profile loaded",
      data: serializeDoc(
        toAdminProfileData(admin, {
          totalActions,
          actionsLast24h,
          actionsLast7d,
        }),
      ),
    };
  } catch (error) {
    console.error("Failed to load admin profile:", error);
    return {
      success: false,
      message: "Failed to load admin profile",
    };
  }
}

export async function updateAdminProfileAction(
  payload: AdminProfileUpdatePayload,
): Promise<AdminActionResult<AdminProfileData>> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid profile payload",
      };
    }

    const usersCollection = await dbConnect(collections.USERS);

    const updatePayload = {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      profileImage: parsed.data.profileImage,
      preferences: {
        timezone: parsed.data.timezone,
        notifications: parsed.data.notifications,
      },
      updatedAt: new Date(),
    };

    const result = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(auth.adminId),
        role: "admin",
      },
      {
        $set: updatePayload,
      },
      {
        projection: {
          password: 0,
        },
        returnDocument: "after",
      },
    );

    if (!result) {
      return {
        success: false,
        message: "Admin profile update failed",
      };
    }

    await logAdminProfileAction({
      adminId: auth.adminId,
      action: "profile_update",
      reason: "Admin profile preferences updated",
      metadata: {
        changedFields: ["fullName", "phone", "profileImage", "preferences"],
      },
    });

    const current = await getAdminProfileAction();
    if (!current.success || !current.data) {
      return {
        success: true,
        message: "Profile updated",
      };
    }

    return {
      success: true,
      message: "Profile updated",
      data: current.data,
    };
  } catch (error) {
    console.error("Failed to update admin profile:", error);
    return {
      success: false,
      message: "Failed to update admin profile",
    };
  }
}

export async function getAdminSecurityActivityAction(
  limit: number = 20,
): Promise<AdminActionResult<AdminSecurityEvent[]>> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
      };
    }

    const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;

    const rows = await auditCollection
      .find({ actorId: auth.adminId })
      .sort({ createdAt: -1 })
      .limit(Math.min(normalizedLimit, 100))
      .toArray();

    const events: AdminSecurityEvent[] = rows.map((row: any) => ({
      _id: String(row._id),
      action: row.action || "unknown_action",
      reason: row.reason || null,
      createdAt: row?.createdAt?.toISOString?.() || new Date().toISOString(),
      entityType: row.entityType || null,
      entityId: row.entityId ? String(row.entityId) : null,
      metadata: row.metadata || {},
    }));

    return {
      success: true,
      message: "Security activity loaded",
      data: serializeDoc(events),
    };
  } catch (error) {
    console.error("Failed to load admin activity:", error);
    return {
      success: false,
      message: "Failed to load security activity",
      data: [],
    };
  }
}

export async function getAdminSessionsAction(
  limit: number = 6,
): Promise<AdminActionResult<AdminSessionItem[]>> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
      };
    }

    const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);
    const session = await getServerSession(authOptions);

    const rows = await auditCollection
      .find({ actorId: auth.adminId })
      .sort({ createdAt: -1 })
      .limit(Math.max(10, limit * 3))
      .toArray();

    const nowIso = new Date().toISOString();
    const currentUa = session?.user?.name
      ? "Current browser"
      : "Current session";

    const map = new Map<string, AdminSessionItem>();

    map.set("current", {
      id: "current",
      label: currentUa,
      isCurrent: true,
      lastSeenAt: nowIso,
      ipAddress: null,
      userAgent: null,
    });

    for (const row of rows) {
      const metadata = row?.metadata || {};
      const ua =
        typeof metadata.userAgent === "string" ? metadata.userAgent : null;
      const ip =
        typeof metadata.ipAddress === "string" ? metadata.ipAddress : null;
      const sourceKey = ua || ip;
      if (!sourceKey) continue;

      if (map.has(sourceKey)) continue;

      map.set(sourceKey, {
        id: sourceKey,
        label: ua ? ua.slice(0, 54) : "Unknown device",
        isCurrent: false,
        lastSeenAt: row?.createdAt?.toISOString?.() || nowIso,
        ipAddress: ip,
        userAgent: ua,
      });
    }

    const sessions = Array.from(map.values()).slice(0, Math.max(1, limit));

    return {
      success: true,
      message: "Sessions loaded",
      data: sessions,
    };
  } catch (error) {
    console.error("Failed to load admin sessions:", error);
    return {
      success: false,
      message: "Failed to load admin sessions",
      data: [],
    };
  }
}

export async function revokeSessionAction(
  sessionId: string,
): Promise<AdminActionResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    if (!sessionId || sessionId === "current") {
      return {
        success: false,
        message: "Current session cannot be revoked from this panel",
      };
    }

    const usersCollection = await dbConnect(collections.USERS);
    await usersCollection.updateOne(
      {
        _id: new ObjectId(auth.adminId),
      },
      {
        $set: {
          "security.sessionInvalidatedAt": new Date(),
          updatedAt: new Date(),
        },
      },
    );

    await logAdminProfileAction({
      adminId: auth.adminId,
      action: "session_revoke",
      reason: "Admin revoked a remembered device session",
      metadata: {
        revokedSession: sessionId,
      },
    });

    return {
      success: true,
      message: "Session revoke request recorded",
    };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return {
      success: false,
      message: "Failed to revoke session",
    };
  }
}

export async function changeAdminPasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AdminActionResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = passwordChangeSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid password payload",
      };
    }

    const usersCollection = await dbConnect(collections.USERS);
    const admin = await usersCollection.findOne(
      {
        _id: new ObjectId(auth.adminId),
        role: "admin",
      },
      {
        projection: {
          password: 1,
        },
      },
    );

    if (!admin?.password) {
      return {
        success: false,
        message: "Password-based re-auth is unavailable for this account",
      };
    }

    const matched = await bcrypt.compare(
      parsed.data.currentPassword,
      admin.password,
    );
    if (!matched) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    const nextHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await usersCollection.updateOne(
      {
        _id: new ObjectId(auth.adminId),
      },
      {
        $set: {
          password: nextHash,
          "security.passwordChangedAt": new Date(),
          updatedAt: new Date(),
        },
      },
    );

    await logAdminProfileAction({
      adminId: auth.adminId,
      action: "password_change",
      reason: "Admin changed password via my profile",
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Failed to change admin password:", error);
    return {
      success: false,
      message: "Failed to change password",
    };
  }
}

export async function updateAdminMfaAction(input: {
  currentPassword: string;
  enabled: boolean;
}): Promise<AdminActionResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = toggleMfaSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid MFA payload",
      };
    }

    const usersCollection = await dbConnect(collections.USERS);
    const admin = await usersCollection.findOne(
      {
        _id: new ObjectId(auth.adminId),
        role: "admin",
      },
      {
        projection: {
          password: 1,
        },
      },
    );

    if (!admin?.password) {
      return {
        success: false,
        message: "Password-based re-auth is unavailable for this account",
      };
    }

    const matched = await bcrypt.compare(
      parsed.data.currentPassword,
      admin.password,
    );
    if (!matched) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    await usersCollection.updateOne(
      {
        _id: new ObjectId(auth.adminId),
      },
      {
        $set: {
          "security.mfaEnabled": parsed.data.enabled,
          "security.mfaUpdatedAt": new Date(),
          updatedAt: new Date(),
        },
      },
    );

    await logAdminProfileAction({
      adminId: auth.adminId,
      action: parsed.data.enabled ? "mfa_enable" : "mfa_disable",
      reason: "Admin changed MFA preference",
    });

    return {
      success: true,
      message: parsed.data.enabled
        ? "MFA enabled successfully"
        : "MFA disabled successfully",
    };
  } catch (error) {
    console.error("Failed to update MFA:", error);
    return {
      success: false,
      message: "Failed to update MFA settings",
    };
  }
}

export async function runAdminQuickModerationAction(
  payload: AdminQuickModerationPayload,
): Promise<AdminActionResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = quickModerationSchema.safeParse({
      ...payload,
      targetEmail: normalizeEmail(payload.targetEmail),
      reason: payload.reason?.trim() || "",
    });

    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message || "Invalid moderation payload",
      };
    }

    if (
      (parsed.data.action === "suspend" || parsed.data.action === "ban") &&
      !parsed.data.reason
    ) {
      return {
        success: false,
        message: "Reason is required for suspend/ban actions",
      };
    }

    if (parsed.data.actorType === "patient") {
      const usersCollection = await dbConnect(collections.USERS);
      const target = await usersCollection.findOne(
        {
          role: "patient",
          email: normalizeEmail(parsed.data.targetEmail),
        },
        {
          projection: {
            _id: 1,
            email: 1,
          },
        },
      );

      if (!target?._id) {
        return {
          success: false,
          message: "Patient not found for that email",
        };
      }

      const result = await moderatePatientAction(
        String(target._id),
        parsed.data.action,
        parsed.data.reason || "Moderation update from admin profile",
        parsed.data.action === "suspend" ? "duration" : undefined,
        parsed.data.action === "suspend" ? parsed.data.durationDays : undefined,
      );

      return {
        success: result.success,
        message: result.message,
      };
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const doctor = await doctorsCollection.findOne(
      {
        email: normalizeEmail(parsed.data.targetEmail),
      },
      {
        projection: {
          _id: 1,
          email: 1,
        },
      },
    );

    if (!doctor?._id) {
      return {
        success: false,
        message: "Doctor not found for that email",
      };
    }

    const result = await moderateDoctorAction(
      String(doctor._id),
      parsed.data.action,
      parsed.data.reason || "Moderation update from admin profile",
      parsed.data.action === "suspend" ? parsed.data.durationDays : undefined,
    );

    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error("Failed quick moderation action:", error);
    return {
      success: false,
      message: "Failed to run moderation action",
    };
  }
}
