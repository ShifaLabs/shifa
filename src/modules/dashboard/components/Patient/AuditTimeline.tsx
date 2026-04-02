import { Clock, History } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const trail = appointment?.auditTrail ?? [];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className=" px-4">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">
              History Timeline
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {trail.length} events
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {trail.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs text-muted-foreground border border-dashed rounded-xl">
            No activity yet
          </div>
        ) : (
          <ScrollArea className="h-90 pr-2">
            <div className="flex flex-col gap-3">
              {trail.map((item, index) => (
                <ActivityItem key={index} item={item} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ item }: { item: AuditItem }) {
  const date = new Date(item.at);

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition">
      {/* Left Content */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-foreground capitalize">
          {item.action.replace(/_/g, " ")}
        </p>

        <p className="text-xs text-muted-foreground">
          {item.from ? `${item.from} → ${item.to}` : `Created → ${item.to}`}
        </p>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
        <Clock className="w-3 h-3" />
        {date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}
