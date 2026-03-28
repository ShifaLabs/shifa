export type AdminNotificationPreferences = {
  productUpdates: boolean;
  securityAlerts: boolean;
  moderationDigest: boolean;
};

export type AdminProfileData = {
  _id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  timezone: string;
  role: "admin";
  status: "active" | "inactive" | "pending" | "rejected";
  moderationState: "none" | "suspended" | "banned";
  createdAt: string | null;
  updatedAt: string | null;
  profileCompleted: boolean;
  mfaEnabled: boolean;
  notifications: AdminNotificationPreferences;
  stats: {
    totalActions: number;
    actionsLast24h: number;
    actionsLast7d: number;
  };
};

export type AdminProfileUpdatePayload = {
  fullName: string;
  phone: string | null;
  profileImage: string | null;
  timezone: string;
  notifications: AdminNotificationPreferences;
};

export type AdminSecurityEvent = {
  _id: string;
  action: string;
  reason: string | null;
  createdAt: string;
  entityType: string | null;
  entityId: string | null;
  metadata?: Record<string, unknown>;
};

export type AdminSessionItem = {
  id: string;
  label: string;
  isCurrent: boolean;
  lastSeenAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export type AdminQuickModerationActor = "patient" | "doctor";
export type AdminQuickModerationAction = "suspend" | "ban" | "reactivate";

export type AdminQuickModerationPayload = {
  actorType: AdminQuickModerationActor;
  targetEmail: string;
  action: AdminQuickModerationAction;
  reason: string;
  durationDays?: number;
};

export type AdminActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};
