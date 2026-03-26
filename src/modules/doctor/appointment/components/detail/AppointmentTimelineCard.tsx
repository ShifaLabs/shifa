import { Clock3 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { DoctorAppointmentDetailResponse } from "../../types/doctor-appointment-detail.types";
import { formatDateTimeLabel } from "../../utils/doctor-appointment-detail.utils";

type Props = {
  detail: DoctorAppointmentDetailResponse;
};

export default function AppointmentTimelineCard({ detail }: Props) {
  const events = detail.appointment.auditTrail || [];

  return (
    <Card className="p-4 md:p-6">
      <CardHeader>
        <CardTitle className="text-base">Appointment Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No timeline events available.
          </p>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => (
              <div
                key={`${event.at || "event"}-${index}`}
                className="rounded-lg border bg-muted/20 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {event.action || "Status changed"}
                  </p>
                  <Badge variant="outline">
                    {event.performedBy || "System"}
                  </Badge>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {event.from || "Unknown"} -&gt; {event.to || "Unknown"}
                </p>

                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5" />
                  {formatDateTimeLabel(event.at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
