import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function KpiCards({ stats }) {
  const cards = [
    {
      id: "today",
      label: "Today",
      value: stats.today,
      tone: "bg-sky-50 border-sky-200 ",
      desc: "Appointments happening today",
    },
    {
      id: "upcoming",
      label: "Upcoming",
      value: stats.upcoming,
      tone: "bg-cyan-50 border-cyan-200",
      desc: "Future scheduled consultations",
    },
    {
      id: "completed",
      label: "Completed",
      value: stats.completed,
      tone: "bg-emerald-50 border-emerald-200",
      desc: "Consultations completed",
    },
    {
      id: "noShow",
      label: "No-show",
      value: stats.noShow,
      tone: "bg-rose-50 border-rose-200",
      desc: "Appointments marked no-show",
    },
  ];

  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Doctor KPI cards"
    >
      {cards.map((card) => (
        <Card key={card.id} className={`border ${card.tone} p-4 md:p-6`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground/80">
              {card.label}
            </CardTitle>
            <CardDescription>{card.desc}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
