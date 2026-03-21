"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/ui/button";
import { CalendarDays, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getDoctorProfileImage } from "@/infrastructure/lib/legacy/utils";

export default function BookAppointmentModal({
  doctor,
  open,
  setOpen,
  setToastMessage,
}) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => (document.body.style.overflow = "auto");
  }, [open]);

  useEffect(() => {
    if (date) {
      fetch(`/api/slots/${doctor._id}?date=${date}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.offDay) {
            setSlots([]);
            return;
          }

          setSlots(data.slots || []);
        });
    }
  }, [date, doctor._id]);

  const handleBook = async () => {
    // role validation
    if (!session || session.user.role !== "patient") {
      setToastMessage({
        message:
          "Only patients can book appointments. Please login as patient.",
        type: "error",
      });

      setOpen(false);

      setTimeout(() => {
        router.push("/login");
      }, 1500);

      return;
    }
    // Field validation
    if (!date || !selectedTime || !symptoms) {
      setToastMessage({
        message: "Please fill all fields!",
        type: "error",
      });
      return;
    }

    // TIMEZONE CREATION (Bangladesh UTC+6)
    const appointmentDate = new Date(`${date}T${selectedTime}:00+06:00`);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor: doctor._id,
          appointmentDate,
          consultationType: "video",
          symptoms,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setToastMessage({
          message: data.message || "Appointment requested successfully!",
          type: "success",
        });

        setOpen(false);
        setDate("");
        setSelectedTime("");
        setSymptoms("");
        router.push("/dashboard/patient/appointments");
      } else if (res.status === 401) {
        setToastMessage({
          message: "Unauthorized. Please login as a patient.",
          type: "error",
        });

        setOpen(false);

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setToastMessage({
          message: data.error || "Something went wrong",
          type: "error",
        });
      }
    } catch (error) {
      setToastMessage({
        message: "Network error. Please try again.",
        type: "error",
      });
    }
  };

  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold text-foreground">
              Book Appointment
            </h2>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-full hover:bg-muted transition"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Doctor Summary */}
        <div className="p-4 rounded-xl bg-muted border border-border space-y-2">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 rounded-xl">
              <AvatarImage
                src={getDoctorProfileImage(doctor.profileImage, doctor.gender)}
                alt={doctor.fullName}
                className="object-cover"
              />
              <AvatarFallback>{doctor.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{doctor.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {doctor.specialization}
              </p>
              <p className="text-sm text-muted-foreground">
                {doctor.experienceYears} Years Experience
              </p>
            </div>
          </div>
        </div>

        {/* Date Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Select Date
          </label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Slots Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">
            Available Time Slots
          </label>

          {!date && (
            <p className="text-sm text-muted-foreground">
              Please select a date first.
            </p>
          )}

          {date && slots.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No slots available. {doctor.fullName} is not available on this
              day. Please choose another date.
            </p>
          )}

          {date && slots.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {slots.map((slot, i) => (
                <button
                  key={i}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`h-10 rounded-xl border text-sm font-medium transition ${
                    selectedTime === slot.time
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-background border-border hover:bg-muted"
                  } ${slot.isBooked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Symptoms Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Describe Symptoms
          </label>
          <textarea
            placeholder="Write symptoms or medical concerns..."
            rows={4}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            className="flex-1 rounded-xl h-11 shadow-md shadow-primary/20"
            onClick={handleBook}
          >
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
