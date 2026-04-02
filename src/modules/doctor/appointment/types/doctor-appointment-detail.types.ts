import type { ConsultationSummary } from "./doctor-appointment.types";

export type FollowUpPriority = "routine" | "important" | "urgent";

export interface DoctorAppointmentDetailPatientProfile {
  _id: string | null;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  gender?: string;
  age?: number | null;
  address?: {
    street?: string | null;
    city?: string | null;
    country?: string | null;
    zipCode?: string | null;
  };
}

export interface DoctorAppointmentDetailAuditEvent {
  action?: string;
  performedBy?: string;
  from?: string | null;
  to?: string;
  at?: string;
}

export interface DoctorAppointmentDetailVideoSession {
  provider?: string;
  callId?: string;
  meetingLink?: string;
  joinFrom?: string;
  joinUntil?: string;
}

export interface DoctorAppointmentDetailRecord {
  _id: string;
  appointmentId?: string;
  appointmentDate?: string;
  dateKey?: string;
  timeSlot?: string;
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
  videoSession?: DoctorAppointmentDetailVideoSession;
  auditTrail?: DoctorAppointmentDetailAuditEvent[];
  createdAt?: string;
  updatedAt?: string;
  patientInfo?: DoctorAppointmentDetailPatientProfile;
}

export interface DoctorFollowUpEntry {
  _id: string;
  instructions: string;
  notes: string;
  nextVisitAt?: string | null;
  priority: FollowUpPriority;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdByUserId?: string | null;
}

export interface DoctorVideoReadiness {
  provider?: string;
  callId?: string | null;
  meetingLink?: string | null;
  hasCallId: boolean;
  hasMeetingLink: boolean;
  joinFrom?: string | null;
  joinUntil?: string | null;
  canJoinNow: boolean;
}

export interface DoctorAppointmentDetailResponse {
  appointment: DoctorAppointmentDetailRecord;
  followUps: DoctorFollowUpEntry[];
  videoReadiness: DoctorVideoReadiness;
}

export interface DoctorAppointmentDetailApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: DoctorAppointmentDetailResponse;
}

export interface SaveFollowUpPayload {
  instructions: string;
  notes?: string;
  priority: FollowUpPriority;
  nextVisitAt?: string | null;
}
