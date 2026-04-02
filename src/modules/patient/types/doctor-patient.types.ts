export type PatientTimelineStatus = "active" | "past";

export interface DoctorCommunicationPatient {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  nextAppointment?: Date | string;
  lastVisit?: Date | string;
  totalUpcoming?: number;
  totalVisits?: number;
  lastSymptoms?: string;
  lastConsultationType?: string;
  hasVideoConsultation?: boolean;
  nextVideoAppointment?: Date | string | null;
  followUpDueCount?: number;
  followUpOverdueCount?: number;
  nextFollowUpAt?: Date | string | null;
}
