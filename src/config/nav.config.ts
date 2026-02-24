// src/config/nav.config.ts

import {
  Home,
  Users,
  CalendarDays,
  FileText,
  Settings,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { PERMISSIONS, Permission } from "./permissions";
import { Role } from "./role-permissions";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  requiredPermissions?: Permission[];
};

export const NAV_CONFIG: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: Home },

    {
      label: "Doctors",
      href: "/dashboard/admin/doctors",
      icon: Stethoscope,
      requiredPermissions: [PERMISSIONS.MANAGE_DOCTORS],
    },
    {
      label: "Patients",
      href: "/dashboard/admin/patients",
      icon: Users,
      requiredPermissions: [PERMISSIONS.MANAGE_PATIENTS],
    },
    {
      label: "Appointments",
      href: "/dashboard/admin/appointments",
      icon: CalendarDays,
      requiredPermissions: [PERMISSIONS.VIEW_ALL_APPOINTMENTS],
    },
    {
      label: "Reports",
      href: "/dashboard/admin/reports",
      icon: FileText,
      requiredPermissions: [PERMISSIONS.VIEW_REPORTS],
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
      requiredPermissions: [PERMISSIONS.MANAGE_SYSTEM_SETTINGS],
    },
  ],

  doctor: [
    { label: "Dashboard", href: "/dashboard/doctor", icon: Home },

    {
      label: "My Appointments",
      href: "/dashboard/doctor/appointments",
      icon: CalendarDays,
      requiredPermissions: [PERMISSIONS.VIEW_ASSIGNED_APPOINTMENTS],
    },
    {
      label: "My Patients",
      href: "/dashboard/doctor/patients",
      icon: Users,
      requiredPermissions: [PERMISSIONS.VIEW_ASSIGNED_PATIENTS],
    },
    {
      label: "Medical Reports",
      href: "/dashboard/doctor/reports",
      icon: FileText,
      requiredPermissions: [PERMISSIONS.WRITE_MEDICAL_REPORT],
    },
    {
      label: "Profile Settings",
      href: "/dashboard/doctor/settings",
      icon: Settings,
      requiredPermissions: [PERMISSIONS.UPDATE_DOCTOR_PROFILE],
    },
  ],

  patient: [
    { label: "Dashboard", href: "/dashboard/patient", icon: Home },

    {
      label: "Book Appointment",
      href: "/dashboard/patient/book",
      icon: CalendarDays,
      requiredPermissions: [PERMISSIONS.BOOK_APPOINTMENT],
    },
    {
      label: "My Appointments",
      href: "/dashboard/patient/appointments",
      icon: CalendarDays,
      requiredPermissions: [PERMISSIONS.VIEW_OWN_APPOINTMENTS],
    },
    {
      label: "Medical History",
      href: "/dashboard/patient/history",
      icon: FileText,
      requiredPermissions: [PERMISSIONS.VIEW_OWN_HISTORY],
    },
    {
      label: "Settings",
      href: "/dashboard/patient/settings",
      icon: Settings,
      requiredPermissions: [PERMISSIONS.UPDATE_PATIENT_PROFILE],
    },
  ],
};
