// src/config/permissions.ts

export const PERMISSIONS = {
  // Admin
  MANAGE_DOCTORS: "manage_doctors",
  MANAGE_PATIENTS: "manage_patients",
  VIEW_ALL_APPOINTMENTS: "view_all_appointments",
  VIEW_REPORTS: "view_reports",
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",

  // Doctor
  VIEW_ASSIGNED_APPOINTMENTS: "view_assigned_appointments",
  VIEW_ASSIGNED_PATIENTS: "view_assigned_patients",
  WRITE_MEDICAL_REPORT: "write_medical_report",
  UPDATE_DOCTOR_PROFILE: "update_doctor_profile",

  // Patient
  BOOK_APPOINTMENT: "book_appointment",
  VIEW_OWN_APPOINTMENTS: "view_own_appointments",
  VIEW_OWN_HISTORY: "view_own_history",
  UPDATE_PATIENT_PROFILE: "update_patient_profile",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
