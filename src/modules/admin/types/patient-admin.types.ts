export type ModerationState = "none" | "suspended" | "banned";
export type TrustLevel = "low" | "medium" | "high";

export type PatientStatusFilter =
  | "all"
  | "active"
  | "inactive"
  | "pending"
  | "rejected";

export type ModerationFilter = "all" | ModerationState;

export type PatientSortBy = "createdAt" | "fullName" | "updatedAt";

export type JoinedRange = "all" | "7d" | "30d" | "90d";

export type ModerationAction = "suspend" | "ban" | "reactivate";

export type SuspensionMode = "duration" | "open-ended";

export type PatientListOptions = {
  search?: string;
  moderationState?: ModerationFilter;
  trustLevel?: "all" | TrustLevel;
  joinedRange?: JoinedRange;
  sortBy?: PatientSortBy;
  sortOrder?: "asc" | "desc";
};

export type PatientActivitySummary = {
  totalAppointments: number;
  completedAppointments: number;
  approvedAppointments: number;
  lastAppointmentAt: string | null;
};

export type PatientRisk = {
  score: number;
  level: TrustLevel;
  reasons: string[];
};

export type PatientAdminRecord = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
  isVerified?: boolean;
  isBanned?: boolean;
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  moderation?: {
    state?: ModerationState;
    reason?: string | null;
    until?: string | null;
    updatedAt?: string | null;
    updatedBy?: string | null;
  };
  activity: PatientActivitySummary;
  risk: PatientRisk;
};

export type PatientAdminListStats = {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  banned: number;
  unverified: number;
};

export type AdminAuditEntry = {
  _id: string;
  action: string;
  reason?: string | null;
  actorId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type PatientRow = PatientAdminRecord;
export type PatientAuditEntry = AdminAuditEntry;
export type PatientModerationAction = ModerationAction;
