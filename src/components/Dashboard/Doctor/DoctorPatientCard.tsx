"use client";

import { CalendarDays, Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { useEffect, useMemo, useState } from "react";

type Patient = {
  _id: string | ObjectId;
  fullName: string;
  email: string;
  profileImage?: string;
  nextAppointment?: string | Date;
  lastVisit?: string | Date;
  totalUpcoming?: number;
  totalVisits?: number;
};

type Props = {
  patient: Patient;
  type: "active" | "past";
};

export default function DoctorPatientCard({ patient, type }: Props) {
  const appointmentDate = useMemo(() => {
    return new Date(
      type === "active" ? patient.nextAppointment! : patient.lastVisit!,
    );
  }, [patient.nextAppointment, patient.lastVisit, type]);

  const formattedDate = appointmentDate.toLocaleDateString();
  const formattedTime = appointmentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (type !== "active") return;

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

  return (
    <div className="bg-base-100 border border-base-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all">
      {/* Patient Info */}
      <div className="flex items-center gap-4 mb-5">
        <Image
          src={patient.profileImage || "/avatar.png"}
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
        </div>
      </div>

      {/* Appointment Info */}
      <div className="space-y-3 text-sm text-gray-600 mb-5">
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>
            Visits:
            <span className="ml-1 font-medium text-base-content">
              {type === "active" ? patient.totalUpcoming : patient.totalVisits}
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

          <span className="font-medium text-base-content">{formattedTime}</span>
        </div>

        {/* Countdown only for active */}
        {type === "active" && (
          <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-lg w-fit">
            Starts in {countdown}
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <Link
          href={`/dashboard/doctor/appointments?patient=${patient._id}`}
          className="px-4 py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 transition"
        >
          View Appointments
        </Link>
      </div>
    </div>
  );
}
