"use client";

import Image from "next/image";
import { Video, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const MyAppointmentCard = ({ appointment }) => {
  const detailsPath =
    appointment.appointmentDetailsPath ||
    (appointment._id
      ? `/dashboard/doctor/appointments/${appointment._id}`
      : "#");
  const consultationLink = appointment.consultationLink;

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-6">
      {/* Patient Info */}
      <div className="flex items-center gap-4 mb-5">
        {appointment.patientImage ? (
          <Image
            src={appointment.patientImage}
            alt={appointment.patientName || "Patient"}
            width={50}
            height={50}
            className="rounded-full"
          />
        ) : (
          <div className="w-12.5 h-12.5 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
            {(appointment.patientName || "P").charAt(0)}
          </div>
        )}
        <div>
          <div className="flex justify-between">
            <h2 className="font-semibold text-lg text-gray-800">
              {appointment.patientName}
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
              {appointment.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{appointment.patientEmail}</p>
        </div>
      </div>

      {/* Appointment Info */}
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          {new Date(appointment.appointmentDate).toDateString()}
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          {appointment.timeSlot}
        </div>
        <div className="flex items-center gap-2">
          <Video size={16} />
          {appointment.consultationType}
        </div>
        <div>
          <span className="font-medium text-gray-700">Symptoms:</span>{" "}
          {appointment.symptoms}
        </div>
      </div>

      {/* Status & Meeting */}
      <div className="mt-4 flex items-center justify-between">
        <Link href={detailsPath}>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </Link>
        {appointment.consultationType === "video" && consultationLink && (
          <a
            href={consultationLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Join Meeting
          </a>
        )}
      </div>
    </div>
  );
};

export default MyAppointmentCard;
