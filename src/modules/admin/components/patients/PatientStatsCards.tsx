import {
  CardWithPadding,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { PatientAdminListStats } from "@/modules/admin/types/patient-admin.types";

type Props = {
  stats: PatientAdminListStats;
};

const cards = [
  { key: "total", label: "Total Patients", tone: "bg-sky-50" },
  { key: "active", label: "Active", tone: "bg-emerald-50" },
  { key: "inactive", label: "Inactive", tone: "bg-zinc-100" },
  { key: "suspended", label: "Suspended", tone: "bg-amber-50" },
  { key: "banned", label: "Banned", tone: "bg-rose-50" },
  { key: "unverified", label: "Unverified", tone: "bg-violet-50" },
] as const;

export default function PatientStatsCards({ stats }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map((card) => (
        <CardWithPadding key={card.key} className={card.tone}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-900">
              {stats[card.key].toLocaleString()}
            </p>
          </CardContent>
        </CardWithPadding>
      ))}
    </section>
  );
}
