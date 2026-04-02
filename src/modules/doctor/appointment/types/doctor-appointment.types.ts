export type AppointmentTab =
  | "today"
  | "upcoming"
  | "completed"
  | "cancelled"
  | "no-show";

export type AppointmentStatusKey =
  | "pendingpayment"
  | "approved"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show"
  | "expired"
  | "scheduled"
  | "unknown";

export type PaymentStatusKey = "paid" | "unpaid" | "unknown";

export interface DoctorAppointmentPatientInfo {
  _id: string | null;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
}

export interface DoctorAppointmentVideoSession {
  provider?: string;
  callId?: string;
  meetingLink?: string;
  joinFrom?: string;
  joinUntil?: string;
}

export interface ConsultationSummary {
  medicines?: string;
  notes?: string;
  submittedAt?: string;
  submittedBy?: string | null;
}

export interface DoctorAppointmentRaw {
  _id: string;
  appointmentId?: string;
  appointmentDate?: string;
  status?: string;
  paymentStatus?: string;
  consultationType?: string;
  symptoms?: string;
  consultationSummary?: ConsultationSummary;
  patientInfo?: Partial<DoctorAppointmentPatientInfo>;
  videoSession?: DoctorAppointmentVideoSession;
  payment?: {
    status?: string;
    amount?: number;
    currency?: string;
  };
}

export interface DoctorAppointment {
  _id: string;
  appointmentId: string;
  appointmentDate: string;
  appointmentDateObject: Date | null;
  dateBucket: "today" | "future" | "past" | "unknown";
  status: string;
  statusKey: AppointmentStatusKey;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusKey: PaymentStatusKey;
  consultationType: string;
  symptoms: string;
  consultationSummary: ConsultationSummary;
  patientInfo: DoctorAppointmentPatientInfo;
  videoSession: DoctorAppointmentVideoSession;
}

export interface PatientHistoryEntry {
  _id: string;
  appointmentId?: string;
  appointmentDate?: string;
  status?: string;
  consultationType?: string;
  symptoms?: string;
  consultationSummary?: ConsultationSummary;
  paymentStatus?: string;
  payment?: {
    status?: string;
    amount?: number;
    currency?: string;
  };
  videoSession?: {
    provider?: string;
    callId?: string;
    meetingLink?: string;
    endedAt?: string;
    durationSeconds?: number;
  };
  auditTrail?: Array<{
    action?: string;
    performedBy?: string;
    from?: string | null;
    to?: string;
    at?: string;
  }>;
  updatedAt?: string;
}

export interface PatientHistoryProfile {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  age?: number | null;
  profileImage?: string;
  address?: {
    street?: string | null;
    city?: string | null;
    country?: string | null;
    zipCode?: string | null;
  };
}

export interface DoctorPatientHistoryResponse {
  patient: PatientHistoryProfile | null;
  history: PatientHistoryEntry[];
}

export interface DoctorAppointmentsApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    totalAppointments?: number;
    appointments?: DoctorAppointmentRaw[];
  };
  error?: string;
}

export interface DoctorAppointmentListState {
  loading: boolean;
  error: string;
  appointments: DoctorAppointment[];
}
