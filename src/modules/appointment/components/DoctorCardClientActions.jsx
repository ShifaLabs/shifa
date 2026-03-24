"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";
import AppointmentToast from "@/shared/ui/AppointmentToast";

export default function DoctorCardClientActions({ doctor }) {
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const isActive = doctor?.status?.toLowerCase() === "active";

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
        doctor={doctor}
        open={open}
        setOpen={setOpen}
        setToastMessage={setToastMessage}
      />
      {toastMessage && (
        <AppointmentToast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </>
  );
}

