export type AdminActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export type FeatureFlagKey =
  | "enableDoctorSelfOnboarding"
  | "enableRealtimeChat"
  | "enableVideoConsultation"
  | "enableSmartTriage";

export type ModerationAutoExpireMode =
  | "disabled"
  | "warn_only"
  | "auto_release";

export type AdminSettingsSnapshot = {
  version: number;
  featureFlags: Record<FeatureFlagKey, boolean>;
  moderationPolicy: {
    requireReasonForBan: boolean;
    defaultSuspendDurationDays: number;
    maxSuspendDurationDays: number;
    autoExpireMode: ModerationAutoExpireMode;
  };
  securityPrivacy: {
    maxActiveSessionsPerAdmin: number;
    enforceStrictSessionIpCheck: boolean;
    retentionPeriodDays: number;
    piiExportApprovalRequired: boolean;
  };
  updatedAt: string | null;
  updatedBy: string | null;
};

export type UpdateFeatureFlagsPayload = {
  flags: Partial<Record<FeatureFlagKey, boolean>>;
  reason?: string;
};

export type UpdateModerationPolicyPayload = {
  requireReasonForBan: boolean;
  defaultSuspendDurationDays: number;
  maxSuspendDurationDays: number;
  autoExpireMode: ModerationAutoExpireMode;
  reason?: string;
};

export type UpdateSecurityPrivacyPayload = {
  maxActiveSessionsPerAdmin: number;
  enforceStrictSessionIpCheck: boolean;
  retentionPeriodDays: number;
  piiExportApprovalRequired: boolean;
  reason?: string;
};

export type IntegrationHealthItem = {
  key: "database" | "video" | "payment";
  label: string;
  status: "operational" | "degraded" | "down";
  message: string;
  latencyMs: number;
  updatedAt: string;
};

export type IntegrationHealthResponse = {
  generatedAt: string;
  services: IntegrationHealthItem[];
};
