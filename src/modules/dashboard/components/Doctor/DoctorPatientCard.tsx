"use client";

import { CalendarDays, Clock, MessageSquare, Phone, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { getDoctorProfileImage } from "@/infrastructure/lib/legacy/utils";
import DoctorPatientTimelineDrawer from "./DoctorPatientTimelineDrawer";
import type { DoctorCommunicationPatient } from "@/modules/patient/types/doctor-patient.types";

type Props = {
  patient: DoctorCommunicationPatient;
  type: "active" | "past";
};

export default function DoctorPatientCard({ patient, type }: Props) {
  const appointmentDate = useMemo(() => {
    const value =
      type === "active" ? patient.nextAppointment : patient.lastVisit;
    if (!value) return null;

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [patient.nextAppointment, patient.lastVisit, type]);

  const nextVideoDate = useMemo(() => {
    if (!patient.nextVideoAppointment) return null;
    const parsed = new Date(patient.nextVideoAppointment);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [patient.nextVideoAppointment]);

  const formattedDate = appointmentDate
    ? appointmentDate.toLocaleDateString()
    : "Unknown";
  const formattedTime = appointmentDate
    ? appointmentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  const [countdown, setCountdown] = useState("");
  const [isCallReady, setIsCallReady] = useState(false);

  useEffect(() => {
    if (type !== "active" || !appointmentDate) return;

    const updateTimer = () => {
      const now = Date.now();
      const distance = appointmentDate.getTime() - now;

      if (distance <= 0) {
        setCountdown("Starting now");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [appointmentDate, type]);

  useEffect(() => {
    if (!nextVideoDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCallReady(false);
      return;
    }

    const tick = () => {
      const now = Date.now();
      const from = nextVideoDate.getTime() - 10 * 60 * 1000;
      const until = nextVideoDate.getTime() + 60 * 60 * 1000;
      setIsCallReady(now >= from && now <= until);
    };

    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [nextVideoDate]);

  return (
    <Card className="border border-base-200 shadow-sm transition-all hover:shadow-lg">
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-4">
          <Image
            src={getDoctorProfileImage(patient.profileImage, undefined)}
            alt={patient.fullName}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />

          <div className="flex-1">
            <h3 className="font-semibold text-base-content">
              {patient.fullName}
            </h3>
            <p className="text-sm text-gray-500">{patient.email}</p>
            {patient.phone ? (
              <p className="text-xs text-muted-foreground">{patient.phone}</p>
            ) : null}
          </div>

          {(patient.followUpOverdueCount || 0) > 0 ? (
            <Badge variant="destructive">Overdue follow-up</Badge>
          ) : (patient.followUpDueCount || 0) > 0 ? (
            <Badge variant="outline">Follow-up due</Badge>
          ) : null}
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>
              Visits:
              <span className="ml-1 font-medium text-base-content">
                {type === "active"
                  ? patient.totalUpcoming
                  : patient.totalVisits}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            <span>
              {type === "active" ? "Next Appointment:" : "Last Visit:"}
              <span className="ml-1 font-medium text-base-content">
                {formattedDate}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="font-medium text-base-content">
              {formattedTime}
            </span>
          </div>

          {patient.lastSymptoms ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Key symptom:</span>{" "}
              {patient.lastSymptoms}
            </p>
          ) : null}

          {type === "active" && countdown ? (
            <div className="w-fit rounded-lg bg-primary/10 px-3 py-1 text-xs text-primary">
              Starts in {countdown}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" asChild>
            <Link
              href={`/dashboard/doctor/appointments?patient=${patient._id}&focus=message`}
            >
              <MessageSquare className="size-4" />
              Message Context
            </Link>
          </Button>

          {patient.hasVideoConsultation ? (
            <Button
              size="sm"
              variant={isCallReady ? "default" : "outline"}
              asChild
            >
              <Link
                href={`/dashboard/doctor/appointments?patient=${patient._id}&consultation=video`}
              >
                <Phone className="size-4" />
                {isCallReady ? "Call Ready" : "Call Context"}
              </Link>
            </Button>
          ) : null}

          <DoctorPatientTimelineDrawer
            patientId={patient._id}
            patientName={patient.fullName}
          />
        </div>

        <div className="flex justify-end">
          <Button asChild>
            <Link
              href={`/dashboard/doctor/appointments?patient=${patient._id}`}
            >
              View Appointments
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
