// src/config/nav.config.ts

import {
  Home,
  Users,
  CalendarDays,
  FileText,
  Settings,
  Stethoscope,
  type LucideIcon,
  Activity,
  User,
  Clock,
  MessageSquare,
  Hospital,
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
      label: "Doctors Approval",
      href: "/dashboard/admin/doctor-approvals",
      icon: Users,
      requiredPermissions: [PERMISSIONS.MANAGE_DOCTORS],
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
      label: "My Profile",
      href: "/dashboard/admin/my-profile",
      icon: Users,
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
      label: "Schedule Management",
      href: "/dashboard/doctor/schedule-management",
      icon: Clock,
      requiredPermissions: [PERMISSIONS.MANAGE_DOCTOR_SCHEDULE],
    },
    {
      label: "My Profile",
      href: "/dashboard/doctor/my-profile",
      icon: User,
      requiredPermissions: [PERMISSIONS.WRITE_MEDICAL_REPORT],
    },
    {
      label: "Implementation Plan",
      href: "/dashboard/doctor/implementation-plan",
      icon: FileText,
      requiredPermissions: [PERMISSIONS.VIEW_ASSIGNED_APPOINTMENTS],
    },
  ],

  patient: [
    { label: "Dashboard", href: "/dashboard/patient", icon: Home },

    {
      label: "My Appointments",
      href: "/dashboard/patient/appointments",
      icon: CalendarDays,
      requiredPermissions: [PERMISSIONS.VIEW_OWN_APPOINTMENTS],
    },
    {
      label: "Medical History",
      href: "/dashboard/patient/medical-history",
      icon: Activity,
      requiredPermissions: [PERMISSIONS.VIEW_OWN_HISTORY],
    },
    {
      label: "Doctors",
      href: "/dashboard/patient/doctors",
      icon: Stethoscope,
      requiredPermissions: [PERMISSIONS.BOOK_APPOINTMENT],
    },
    {
      label: "Chatbot",
      href: "/dashboard/patient/chatbot",
      icon: MessageSquare,
      requiredPermissions: [PERMISSIONS.BOOK_APPOINTMENT],
    },
    {
      label: "Hospitals",
      href: "/dashboard/patient/hospitals",
      icon: Hospital,
      requiredPermissions: [PERMISSIONS.BOOK_APPOINTMENT],
    },
    {
      label: "Are you Doctor?",
      href: "/dashboard/be-doctor",
      icon: Stethoscope,
    },
    {
      label: "Profile",
      href: "/dashboard/patient/profile",
      icon: User,
    },
  ],
};
