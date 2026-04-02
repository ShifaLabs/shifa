"use client";

import { Button } from "@/shared/ui/button";
import type { AppointmentTab } from "../types/doctor-appointment.types";
import { APPOINTMENT_TABS } from "../utils/doctor-appointment.utils";

type Props = {
  activeTab: AppointmentTab;
  onTabChange: (tab: AppointmentTab) => void;
  counts: Record<AppointmentTab, number>;
};

export default function DoctorAppointmentTabs({
  activeTab,
  onTabChange,
  counts,
}: Props) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Appointment tabs"
    >
      {APPOINTMENT_TABS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Button
            key={tab.key}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange(tab.key)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`appointments-panel-${tab.key}`}
          >
            {tab.label}
            <span className="ml-1 rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] leading-none">
              {counts[tab.key] ?? 0}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
