"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";

export default function DoctorCardClientActions({ doctorId, isActive }) {
  const [open, setOpen] = useState(false);

  // 🔥 Temporary static patient id
  const patientId = "507f1f77bcf86cd799439011";

  return (
    <>
      <Button
        disabled={!isActive}
        className="flex-1 rounded-xl h-11"
        onClick={() => setOpen(true)}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Book Now
      </Button>

      <BookAppointmentModal
        doctorId={doctorId}
        patientId={patientId}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}
