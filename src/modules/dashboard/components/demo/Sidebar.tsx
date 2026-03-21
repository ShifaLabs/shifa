// components/dashboard/Sidebar.tsx
import React from "react";
import {
  LayoutDashboard,
  CalendarCheck2,
  Users,
  UserRound,
  Settings,
  Plus,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: CalendarCheck2, label: "Appointments", active: false },
  { icon: Users, label: "Patients", active: false },
  { icon: UserRound, label: "Doctors", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-[#BFDBFE] flex flex-col sticky top-0 border-r border-blue-100/50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-white p-1.5 rounded-lg shadow-sm">
          <Activity className="w-6 h-6 text-[#4ADE80]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E40AF]">Shifa</h1>
      </div>

      <div className="px-6 mb-8">
        <div className="bg-white/50 rounded-2xl p-8 flex items-center justify-center shadow-inner">
          <Plus
            className="w-10 h-10 text-white drop-shadow-md"
            strokeWidth={3}
          />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
              item.active
                ? "bg-white/40 text-[#1E40AF] shadow-sm"
                : "text-[#1E40AF]/70 hover:bg-white/20 hover:text-[#1E40AF]",
            )}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};
