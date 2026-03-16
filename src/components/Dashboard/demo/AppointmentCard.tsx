// components/dashboard/AppointmentCard.tsx
import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentProps {
  name: string;
  time: string;
  type: string;
}

export const AppointmentCard = ({ name, time, type }: AppointmentProps) => {
  return (
    <div className="flex items-center justify-between p-4 mb-3 bg-white rounded-2xl border border-slate-50 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Check className="text-emerald-500 w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-700 text-sm">{name}</h4>
          <p className="text-xs text-slate-400 font-medium">
            {time} • {type}
          </p>
        </div>
      </div>
      <div className="bg-emerald-100/50 p-1.5 rounded-lg">
        <Check className="w-4 h-4 text-emerald-600" />
      </div>
    </div>
  );
};
