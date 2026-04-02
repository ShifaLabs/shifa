"use client";

import { Stethoscope, Clock, Users, Star, Download, Globe } from "lucide-react";
import MotionDiv from "@/shared/components/Shared/MotionDiv/MotionDiv";
import CountUp from "react-countup";

const stats = [
  {
    icon: Stethoscope,
    end: 1500,
    suffix: "+",
    label: "Verified Doctors",
    color: "text-sky-500",
  },
  {
    icon: Clock,
    end: 8,
    suffix: " Minutes",
    label: "Average waiting time",
    color: "text-indigo-500",
  },
  {
    icon: Users,
    end: 500,
    suffix: "K+",
    label: "People trusted us with their health",
    color: "text-teal-500",
  },
  {
    icon: Star,
    end: 96,
    suffix: "%",
    label: "Users gave 5 star rating",
    color: "text-amber-500",
  },
  {
    icon: Download,
    end: 800,
    suffix: "K+",
    label: "App downloads",
    color: "text-sky-400",
  },
  {
    icon: Globe,
    end: 20,
    suffix: "+",
    label: "Countries Served",
    color: "text-green-500",
  },
];

const StatsSection = () => {
  return (
    <MotionDiv className="w-full bg-stats-bg py-16 px-3 bg-secondary">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-stats-icon-bg flex items-center justify-center">
              <stat.icon
                className={`w-9 h-9 ${stat.color}`}
                strokeWidth={1.5}
              />
            </div>

            <span className="text-2xl md:text-3xl font-bold text-foreground">
              <CountUp
                end={stat.end}
                duration={2}
                suffix={stat.suffix}
                enableScrollSpy
                scrollSpyDelay={200}
              />
            </span>

            <span className="text-sm text-muted-foreground leading-tight max-w-40">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </MotionDiv>
  );
};

export default StatsSection;
