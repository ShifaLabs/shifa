"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";

export default function DoctorCardClientActions({ doctor, isActive }) {
  const [open, setOpen] = useState(false);

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

      <BookAppointmentModal doctor={doctor} open={open} setOpen={setOpen} />
    </>
  );
}
