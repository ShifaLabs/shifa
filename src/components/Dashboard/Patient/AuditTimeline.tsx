import React from "react";
import { CheckCircle2, Circle, Clock, History, ArrowRight } from "lucide-react";

interface AuditItem {
  action: string;
  from?: string;
  to: string;
  at: string;
}

interface AuditTimelineProps {
  appointment: {
    auditTrail?: AuditItem[];
  };
}

export default function AuditTimeline({ appointment }: AuditTimelineProps) {
  const trail = appointment.auditTrail || [];

  if (trail.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[2rem] border border-dashed border-zinc-200 text-center">
        <History className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
        <p className="text-zinc-500 text-sm">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-[#1F6F68]/10 rounded-lg">
          <History className="w-5 h-5 text-[#1F6F68]" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
          Appointment Timeline
        </h2>
      </div>

      <div className="relative space-y-0">
        {trail.map((item, index) => (
          <div key={index} className="relative flex gap-4 pb-8 group last:pb-0">
            {/* Vertical Connector Line */}
            {index !== trail.length - 1 && (
              <span
                className="absolute left-2.75 top-6 w-0.5 h-full bg-zinc-100 group-hover:bg-[#1F6F68]/20 transition-colors"
                aria-hidden="true"
              />
            )}

            {/* Icon Node */}
            <div className="relative flex items-center justify-center">
              <div className="z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#1F6F68] group-hover:scale-110 transition-transform">
                {index === 0 ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1F6F68]" />
                ) : (
                  <Circle className="h-2 w-2 fill-[#1F6F68] text-[#1F6F68]" />
                )}
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 pt-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                <p className="font-bold text-zinc-800 text-sm md:text-base capitalize">
                  {item.action.replace(/_/g, " ")}
                </p>
                <div className="flex items-center text-[10px] md:text-xs font-medium text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(item.at).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              {/* Status Change Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
                  {item.from || "Initiated"}
                </span>
                <ArrowRight className="w-3 h-3 text-zinc-300" />
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1F6F68]/10 text-[#1F6F68] border border-[#1F6F68]/20">
                  {item.to}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
