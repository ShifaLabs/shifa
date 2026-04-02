"use server";

import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import {
  AdminActionResult,
  AdminSettingsSnapshot,
  IntegrationHealthResponse,
  UpdateFeatureFlagsPayload,
  UpdateModerationPolicyPayload,
  UpdateSecurityPrivacyPayload,
} from "@/modules/admin/types/settings-admin.types";

type GuardResult =
  | { ok: true; adminId: string }
  | { ok: false; error: AdminActionResult<any> };

type SettingsDoc = {
  key: "platform";
  version: number;
  featureFlags: AdminSettingsSnapshot["featureFlags"];
  moderationPolicy: AdminSettingsSnapshot["moderationPolicy"];
  securityPrivacy: AdminSettingsSnapshot["securityPrivacy"];
  updatedAt: Date;
  updatedBy: ObjectId | null;
};

const featureFlagsSchema = z.object({
  flags: z
    .object({
      enableDoctorSelfOnboarding: z.boolean().optional(),
      enableRealtimeChat: z.boolean().optional(),
      enableVideoConsultation: z.boolean().optional(),
      enableSmartTriage: z.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one feature flag is required",
    }),
  reason: z.string().trim().max(200).optional(),
});

const moderationPolicySchema = z
  .object({
    requireReasonForBan: z.boolean(),
    defaultSuspendDurationDays: z.number().int().min(1).max(365),
    maxSuspendDurationDays: z.number().int().min(1).max(365),
    autoExpireMode: z.enum(["disabled", "warn_only", "auto_release"]),
    reason: z.string().trim().max(200).optional(),
  })
  .refine(
    (value) => value.defaultSuspendDurationDays <= value.maxSuspendDurationDays,
    {
      message: "Default suspension must be less than or equal to max duration",
      path: ["defaultSuspendDurationDays"],
    },
  );

const securityPrivacySchema = z.object({
  maxActiveSessionsPerAdmin: z.number().int().min(1).max(20),
  enforceStrictSessionIpCheck: z.boolean(),
  retentionPeriodDays: z.number().int().min(30).max(3650),
  piiExportApprovalRequired: z.boolean(),
  reason: z.string().trim().max(200).optional(),
});

const DEFAULT_SETTINGS: Omit<SettingsDoc, "updatedAt" | "updatedBy"> = {
  key: "platform",
  version: 1,
  featureFlags: {
    enableDoctorSelfOnboarding: false,
    enableRealtimeChat: true,
    enableVideoConsultation: true,
    enableSmartTriage: false,
  },
  moderationPolicy: {
    requireReasonForBan: true,
    defaultSuspendDurationDays: 14,
    maxSuspendDurationDays: 90,
    autoExpireMode: "warn_only",
  },
  securityPrivacy: {
    maxActiveSessionsPerAdmin: 3,
    enforceStrictSessionIpCheck: false,
    retentionPeriodDays: 365,
    piiExportApprovalRequired: true,
  },
};

let settingsCache: {
  data: AdminSettingsSnapshot;
  expiresAt: number;
} | null = null;

function clearSettingsCache() {
  settingsCache = null;
}

function serializeDoc<T>(doc: T): T {
  return JSON.parse(
    JSON.stringify(doc, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (
        value &&
        typeof value === "object" &&
        (value._bsontype === "ObjectId" || value._bsontype === "ObjectID")
      ) {
        return value.toString();
      }
      return value;
    }),
  );
}

function mapToSnapshot(doc: SettingsDoc): AdminSettingsSnapshot {
  return {
    version: doc.version,
    featureFlags: doc.featureFlags,
    moderationPolicy: doc.moderationPolicy,
    securityPrivacy: doc.securityPrivacy,
    updatedAt: doc.updatedAt?.toISOString?.() || null,
    updatedBy: doc.updatedBy?.toString?.() || null,
  };
}

async function requireAdminSession(): Promise<GuardResult> {
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

async function ensureSettingsDoc(): Promise<SettingsDoc> {
  const settingsCollection = await dbConnect(collections.ADMIN_SETTINGS);
  const now = new Date();

  await settingsCollection.updateOne(
    { key: "platform" },
    {
      $setOnInsert: {
        ...DEFAULT_SETTINGS,
        updatedAt: now,
        updatedBy: null,
      },
    },
    { upsert: true },
  );

  const doc = await settingsCollection.findOne({ key: "platform" });
  if (!doc) {
    throw new Error("Failed to initialize settings document");
  }

  return doc as unknown as SettingsDoc;
}

async function appendAuditLog(input: {
  adminId: string;
  action: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);
  await auditCollection.insertOne({
    entityType: "settings",
    entityId: "platform",
    action: input.action,
    reason: input.reason || null,
    metadata: input.metadata || {},
    actorId: input.adminId,
    createdAt: new Date(),
  });
}

export async function getAdminSettingsSnapshotAction(): Promise<
  AdminActionResult<AdminSettingsSnapshot>
> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    if (settingsCache && settingsCache.expiresAt > Date.now()) {
      return {
        success: true,
        message: "Settings loaded",
        data: settingsCache.data,
      };
    }

    const doc = await ensureSettingsDoc();
    const snapshot = serializeDoc(mapToSnapshot(doc));

    settingsCache = {
      data: snapshot,
      expiresAt: Date.now() + 15_000,
    };

    return {
      success: true,
      message: "Settings loaded",
      data: snapshot,
    };
  } catch (error) {
    console.error("Failed to load admin settings:", error);
    return {
      success: false,
      message: "Failed to load settings",
    };
  }
}

export async function updateFeatureFlagsAction(
  payload: UpdateFeatureFlagsPayload,
): Promise<AdminActionResult<AdminSettingsSnapshot>> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = featureFlagsSchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid payload",
      };
    }

    const settingsCollection = await dbConnect(collections.ADMIN_SETTINGS);
    const current = await ensureSettingsDoc();
    const nextFlags = {
      ...current.featureFlags,
      ...parsed.data.flags,
    };

    await settingsCollection.updateOne(
      { key: "platform" },
      {
        $set: {
          featureFlags: nextFlags,
          updatedAt: new Date(),
          updatedBy: new ObjectId(auth.adminId),
        },
        $inc: { version: 1 },
      },
    );

    await appendAuditLog({
      adminId: auth.adminId,
      action: "settings.feature_flags.update",
      reason: parsed.data.reason || "Feature flags updated",
      metadata: { changedFlags: Object.keys(parsed.data.flags) },
    });

    clearSettingsCache();
    return getAdminSettingsSnapshotAction();
  } catch (error) {
    console.error("Failed to update feature flags:", error);
    return {
      success: false,
      message: "Failed to update feature flags",
    };
  }
}

export async function updateModerationPolicyAction(
  payload: UpdateModerationPolicyPayload,
): Promise<AdminActionResult<AdminSettingsSnapshot>> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = moderationPolicySchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid payload",
      };
    }

    const settingsCollection = await dbConnect(collections.ADMIN_SETTINGS);

    await settingsCollection.updateOne(
      { key: "platform" },
      {
        $set: {
          moderationPolicy: {
            requireReasonForBan: parsed.data.requireReasonForBan,
            defaultSuspendDurationDays: parsed.data.defaultSuspendDurationDays,
            maxSuspendDurationDays: parsed.data.maxSuspendDurationDays,
            autoExpireMode: parsed.data.autoExpireMode,
          },
          updatedAt: new Date(),
          updatedBy: new ObjectId(auth.adminId),
        },
        $inc: { version: 1 },
      },
      { upsert: true },
    );

    await appendAuditLog({
      adminId: auth.adminId,
      action: "settings.moderation_policy.update",
      reason: parsed.data.reason || "Moderation policy updated",
      metadata: {
        requireReasonForBan: parsed.data.requireReasonForBan,
        defaultSuspendDurationDays: parsed.data.defaultSuspendDurationDays,
        maxSuspendDurationDays: parsed.data.maxSuspendDurationDays,
        autoExpireMode: parsed.data.autoExpireMode,
      },
    });

    clearSettingsCache();
    return getAdminSettingsSnapshotAction();
  } catch (error) {
    console.error("Failed to update moderation policy:", error);
    return {
      success: false,
      message: "Failed to update moderation policy",
    };
  }
}

export async function updateSecurityPrivacyAction(
  payload: UpdateSecurityPrivacyPayload,
): Promise<AdminActionResult<AdminSettingsSnapshot>> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const parsed = securityPrivacySchema.safeParse(payload);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid payload",
      };
    }

    const settingsCollection = await dbConnect(collections.ADMIN_SETTINGS);

    await settingsCollection.updateOne(
      { key: "platform" },
      {
        $set: {
          securityPrivacy: {
            maxActiveSessionsPerAdmin: parsed.data.maxActiveSessionsPerAdmin,
            enforceStrictSessionIpCheck:
              parsed.data.enforceStrictSessionIpCheck,
            retentionPeriodDays: parsed.data.retentionPeriodDays,
            piiExportApprovalRequired: parsed.data.piiExportApprovalRequired,
          },
          updatedAt: new Date(),
          updatedBy: new ObjectId(auth.adminId),
        },
        $inc: { version: 1 },
      },
      { upsert: true },
    );

    await appendAuditLog({
      adminId: auth.adminId,
      action: "settings.security_privacy.update",
      reason: parsed.data.reason || "Security and privacy policy updated",
      metadata: {
        maxActiveSessionsPerAdmin: parsed.data.maxActiveSessionsPerAdmin,
        enforceStrictSessionIpCheck: parsed.data.enforceStrictSessionIpCheck,
        retentionPeriodDays: parsed.data.retentionPeriodDays,
        piiExportApprovalRequired: parsed.data.piiExportApprovalRequired,
      },
    });

    clearSettingsCache();
    return getAdminSettingsSnapshotAction();
  } catch (error) {
    console.error("Failed to update security and privacy settings:", error);
    return {
      success: false,
      message: "Failed to update security and privacy settings",
    };
  }
}

export async function getAdminIntegrationsHealthAction(): Promise<
  AdminActionResult<IntegrationHealthResponse>
> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    const start = Date.now();
    await dbConnect(collections.USERS);
    const dbLatency = Date.now() - start;

    const now = new Date().toISOString();
    return {
      success: true,
      message: "Integrations health loaded",
      data: {
        generatedAt: now,
        services: [
          {
            key: "database",
            label: "MongoDB",
            status: dbLatency > 400 ? "degraded" : "operational",
            message:
              dbLatency > 400
                ? "Database is reachable with elevated latency"
                : "Database is healthy and responsive",
            latencyMs: dbLatency,
            updatedAt: now,
          },
          {
            key: "video",
            label: "Video Provider",
            status: process.env.AGORA_APP_ID ? "operational" : "degraded",
            message: process.env.AGORA_APP_ID
              ? "Video provider credentials detected"
              : "Video provider is missing required environment variables",
            latencyMs: 0,
            updatedAt: now,
          },
          {
            key: "payment",
            label: "Payment Provider",
            status: process.env.SSL_STORE_ID ? "operational" : "degraded",
            message: process.env.SSL_STORE_ID
              ? "Payment provider credentials detected"
              : "Payment provider is missing required environment variables",
            latencyMs: 0,
            updatedAt: now,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Failed to load integrations health:", error);
    return {
      success: false,
      message: "Failed to load integrations health",
    };
  }
}
