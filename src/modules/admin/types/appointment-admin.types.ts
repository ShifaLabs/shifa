export type AppointmentStatusFilter =
  | "all"
  | "PendingPayment"
  | "Approved"
  | "Confirmed"
  | "completed"
  | "Cancelled"
  | "Expired";

export type AppointmentPaymentStatusFilter = "all" | "paid" | "unpaid";

export type AppointmentDateRange = "all" | "7d" | "30d" | "90d";

export type AppointmentSortBy =
  | "appointmentDate"
  | "createdAt"
  | "updatedAt"
  | "patientName";

export type AppointmentAction =
  | "escalate"
  | "cancel"
  | "markNoShow"
  | "markRefundRequired";

export type AppointmentListOptions = {
  search?: string;
  paymentStatus?: AppointmentPaymentStatusFilter;
  specialization?: string;
  dateRange?: AppointmentDateRange;
  sortBy?: AppointmentSortBy;
  sortOrder?: "asc" | "desc";
};

export type AppointmentAdminAuditEntry = {
  _id?: string;
  action: string;
  performedBy?: string;
  from?: string | null;
  to?: string | null;
  at: string;
  reason?: string | null;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
};

export type AppointmentAdminRecord = {
  _id: string;
  appointmentId?: string;
  appointmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  paymentStatus?: "paid" | "unpaid" | string;
  consultationType?: string;
  symptoms?: string;
  patient?: {
    _id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    isBanned?: boolean;
    status?: string;
  };
  doctor?: {
    _id?: string;
    fullName?: string;
    email?: string;
    specialization?: string;
    isBanned?: boolean;
    status?: string;
  };
  adminFlags?: {
    escalated?: boolean;
    noShow?: boolean;
    disputed?: boolean;
    refundRequired?: boolean;
    lastInterventionReason?: string | null;
    lastIntervenedAt?: string | null;
    lastIntervenedBy?: string | null;
  };
  payment?: {
    status?: string;
    amount?: number;
    currency?: string;
    transactionId?: string | null;
  };
};

export type AppointmentAdminListStats = {
  total: number;
  pendingPayment: number;
  approved: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  expired: number;
  paid: number;
  unpaid: number;
  escalated: number;
  noShow: number;
  refundRequired: number;
};

export type AppointmentRow = AppointmentAdminRecord;
