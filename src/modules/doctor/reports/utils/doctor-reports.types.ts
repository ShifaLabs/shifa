export type DoctorReportsRange = "7d" | "30d" | "90d";

export type DoctorReportsOverview = {
  totalAppointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  totalEarnings: number;
  grossEarnings: number;
  doctorEarnings: number;
  platformEarnings: number;
  doctorShareRate: number;
  platformShareRate: number;
  avgConsultationDuration: number;
};

export type DoctorReportsTrendPoint = {
  date: string;
  completed: number;
  cancelled: number;
  noShow: number;
};

export type DoctorReportsEarningsPoint = {
  label: string;
  earnings: number;
  grossEarnings: number;
  doctorEarnings: number;
  platformEarnings: number;
};

export type DoctorReportsEarnings = {
  range: DoctorReportsRange;
  groupBy: "day" | "week";
  items: DoctorReportsEarningsPoint[];
};

export type DoctorReportsStatusDistribution = {
  range: DoctorReportsRange;
  completed: number;
  cancelled: number;
  noShow: number;
  total: number;
  percentages: {
    completed: number;
    cancelled: number;
    noShow: number;
  };
};

export type DoctorReportsDurationPoint = {
  bucket: string;
  count: number;
};

export type DoctorReportsTopPatient = {
  patientId: string;
  fullName: string;
  email: string;
  visits: number;
};

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type MetricState<T> = {
  data: T;
  loading: boolean;
  error: string;
};
