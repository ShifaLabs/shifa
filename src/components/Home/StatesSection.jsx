import { Stethoscope, Clock, Users, Star, Download, Globe } from "lucide-react";

const stats = [
  {
    icon: Stethoscope,
    value: "1500+",
    label: "Verified Doctors",
    color: "text-sky-500",
  },
  {
    icon: Clock,
    value: "8 Minutes",
    label: "Average waiting time",
    color: "text-indigo-500",
  },
  {
    icon: Users,
    value: "500K+",
    label: "People trusted us with their health",
    color: "text-teal-500",
  },
  {
    icon: Star,
    value: "96%",
    label: "Users gave 5 star rating",
    color: "text-amber-500",
  },
  {
    icon: Download,
    value: "800K+",
    label: "App downloads",
    color: "text-sky-400",
  },
  {
    icon: Globe,
    value: "20+",
    label: "Countries Served",
    color: "text-green-500",
  },
];

const StatsSection = () => {
  return (
    <section className="w-full bg-stats-bg py-16 px-3 bg-secondary">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {stats.map((stat) => (
          <div
            key={stat.value}
            className="flex flex-col items-center text-center gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-stats-icon-bg flex items-center justify-center">
              <stat.icon
                className={`w-9 h-9 ${stat.color}`}
                strokeWidth={1.5}
              />
            </div>
            <span className="text-2xl md:text-3xl font-bold text-foreground">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground leading-tight max-w-[160px]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
