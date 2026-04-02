export type ReportsRangeKey = "24h" | "7d" | "30d" | "mtd";

export type ReportsModerationAction = "suspend" | "ban" | "reactivate";

export type ReportsActorType = "patient" | "doctor";

export type ReportsKpis = {
  totalTransactions: number;
  completedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  paymentFailures24h: number;
  completedConsultations: number;
  totalRevenue: number;
  averageTransactionValue: number;
  paymentSuccessRate: number;
};

export type ReportsCharts = {
  revenueTrend: Array<{ label: string; revenue: number }>;
  transactionTrend: Array<{ label: string; transactions: number }>;
  paymentStatus: Array<{ label: string; value: number }>;
  paymentFunnel: Array<{ label: string; value: number }>;
  specializationBreakdown: Array<{
    specialization: string;
    transactions: number;
    revenue: number;
  }>;
  transactionHeatmap: Array<{
    day: string;
    hour: number;
    transactions: number;
  }>;
  topDoctors: Array<{
    doctorName: string;
    specialization: string;
    transactions: number;
    revenue: number;
  }>;
};

export type ReportsModerationSummary = {
  patientsSuspended: number;
  patientsBanned: number;
  doctorsSuspended: number;
  doctorsBanned: number;
  doctorsPendingApproval: number;
};

export type ReportsPatientQueueRow = {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  moderationState: "none" | "suspended" | "banned";
  moderationReason: string | null;
  updatedAt: string | null;
};

export type ReportsDoctorQueueRow = {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  status: string;
  moderationState: "none" | "suspended" | "banned";
  moderationReason: string | null;
  updatedAt: string | null;
};

export type ReportsDashboardData = {
  dateRange: {
    key: ReportsRangeKey;
    startDate: string;
    endDate: string;
  };
  kpis: ReportsKpis;
  charts: ReportsCharts;
  moderationSummary: ReportsModerationSummary;
  queues: {
    patients: ReportsPatientQueueRow[];
    doctors: ReportsDoctorQueueRow[];
  };
};

export type ReportsDashboardResult = {
  success: boolean;
  message: string;
  data?: ReportsDashboardData;
};
