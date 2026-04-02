import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Clock3 } from "lucide-react";
import Link from "next/link";
import {
  formatDateTime,
  getCountdownLabel,
  getInitials,
} from "../service/doctor-dashboard.utils";

export default function QuickWidgets({
  nextPatient,
  pendingConfirmations,
  nowTick,
}) {
  const nextDate = nextPatient?.appointmentDateObject || null;
  const countdown = getCountdownLabel(nextDate, nowTick);
  const nextDateTime = formatDateTime(nextDate);

  return (
    <section
      className="grid gap-4 lg:grid-cols-3"
      aria-label="Doctor quick widgets"
    >
      <Card className="p-4 md:p-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Next Patient</CardTitle>
          <CardDescription>Closest scheduled consultation</CardDescription>
        </CardHeader>
        <CardContent>
          {!nextPatient ? (
            <p className="text-sm text-muted-foreground">
              No upcoming patient right now.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage
                    src={nextPatient?.patientInfo?.profileImage || ""}
                    alt={nextPatient.patientName}
                  />
                  <AvatarFallback>
                    {getInitials(nextPatient.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {nextPatient.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nextDateTime.date} at {nextDateTime.time}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Type:{" "}
                <span className="font-medium text-foreground">
                  {nextPatient.consultationType || "General"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="p-4 md:p-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pending Confirmations</CardTitle>
          <CardDescription>
            Appointments waiting for doctor confirmation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{pendingConfirmations}</span>
            <Badge variant={pendingConfirmations > 0 ? "outline" : "secondary"}>
              {pendingConfirmations > 0 ? "Action needed" : "All clear"}
            </Badge>
          </div>
          <Link
            href="/dashboard/doctor"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Review upcoming list
          </Link>
        </CardContent>
      </Card>

      <Card className="p-4 md:p-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Call-ready Countdown</CardTitle>
          <CardDescription>
            Time until your next consultation starts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="size-4" />
            <span>{countdown}</span>
          </div>

          {nextPatient?._id ? (
            <Link
              href={`/consultation/${nextPatient._id}`}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Open consultation room
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
