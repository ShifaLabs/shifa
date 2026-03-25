import {
  CardWithPadding,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { AppointmentAdminListStats } from "@/modules/admin/types/appointment-admin.types";

type Props = {
  stats: AppointmentAdminListStats;
};

const cards = [
  { key: "total", label: "Total Appointments", tone: "bg-sky-50" },
  { key: "pendingPayment", label: "Pending Payment", tone: "bg-amber-50" },
  { key: "approved", label: "Approved", tone: "bg-cyan-50" },
  { key: "confirmed", label: "Confirmed", tone: "bg-blue-50" },
  { key: "completed", label: "Completed", tone: "bg-emerald-50" },
  { key: "cancelled", label: "Cancelled", tone: "bg-zinc-100" },
  { key: "escalated", label: "Escalated", tone: "bg-rose-50" },
  { key: "refundRequired", label: "Refund Required", tone: "bg-orange-50" },
] as const;

export default function AppointmentStatsCards({ stats }: Props) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
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
