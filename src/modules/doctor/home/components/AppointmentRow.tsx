import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  formatDateTime,
  getInitials,
  getStatusVariant,
} from "../service/doctor-dashboard.utils";
import { Badge } from "@/shared/ui/badge";
import { CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";

export default function AppointmentRow({ appointment }) {
  const dateTime = formatDateTime(appointment.appointmentDateObject);
  const symptoms = String(appointment.symptoms || "").trim();

  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={appointment?.patientInfo?.profileImage || ""}
                alt={appointment.patientName}
              />
              <AvatarFallback>
                {getInitials(appointment.patientName)}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-foreground">
              {appointment.patientName}
            </p>
            <Badge variant={getStatusVariant(appointment.status)}>
              {appointment.normalizedStatus}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            {appointment?.patientInfo?.email || "No email"}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {dateTime.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {dateTime.time}
            </span>
            <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-foreground">
              {appointment.consultationType || "consultation"}
            </span>
          </div>

          {symptoms ? (
            <p className="text-sm text-foreground/85">
              Symptoms: <span className="text-foreground">{symptoms}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No symptom summary provided.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {appointment?.videoSession?.meetingLink ? (
            <a
              href={appointment.videoSession.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
            >
              Meeting link
            </a>
          ) : null}

          <Link
            href={`/consultation/${appointment._id}`}
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open consultation
          </Link>
        </div>
      </div>
    </article>
  );
}
