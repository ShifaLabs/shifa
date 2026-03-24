// components/dashboard/StatsCard.tsx
import React from "react";
import { TrendingUp, Stethoscope, Calendar } from "lucide-react";
import { cn } from "@/infrastructure/lib/legacy/utils";

interface StatsCardProps {
  title: string;
  value: string;
  type: "blue" | "green" | "teal";
  icon?: React.ReactNode;
}

export const StatsCard = ({ title, value, type, icon }: StatsCardProps) => {
  const variants = {
    blue: "bg-gradient-to-br from-[#BFDBFE] to-[#93C5FD] text-blue-900",
    green: "bg-gradient-to-br from-[#BBF7D0] to-[#86EFAC] text-green-900",
    teal: "bg-gradient-to-br from-[#99F6E4] to-[#5EEAD4] text-teal-900",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-[2rem] shadow-sm flex flex-col justify-between h-40 transition-transform hover:scale-[1.02]",
        variants[type],
      )}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium opacity-80">{title}</p>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
        {type === "blue" && <TrendingUp className="mb-1 w-6 h-6" />}
      </div>
    </div>
  );
};
