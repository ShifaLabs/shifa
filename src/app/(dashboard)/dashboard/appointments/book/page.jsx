"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const DOCTORS = [
  { id: "d1", name: "Dr. Michael Chen", specialization: "Cardiology", fee: 150 },
  { id: "d2", name: "Dr. Aisha Rahman", specialization: "Dermatology", fee: 90 },
  { id: "d3", name: "Dr. James Carter", specialization: "Orthopedics", fee: 120 },
];

export default function BookAppointmentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const doctorId = params.get("doctorId");
  const doctor = useMemo(() => DOCTORS.find((d) => d.id === doctorId), [doctorId]);

  const [date, setDate] = useState("");
  const [symptoms, setSymptoms] = useState("");

  if (!doctorId || !doctor) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl font-semibold text-gray-900">
            Invalid doctor selection
          </h1>
          <p className="mt-2 text-gray-600">
            Please go back and select a doctor again.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => router.push("/doctors")}>
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Appointment requested!\nDoctor: ${doctor.name}\nDate: ${date}\nSymptoms: ${symptoms}`);
    router.push("/dashboard/appointments");
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="border rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Book Appointment</h1>
          <p className="mt-1 text-gray-600">
            {doctor.name} • {doctor.specialization} • Fee ${doctor.fee}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Select Date & Time
              </label>
              <Input
                className="mt-2 h-11"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">
                Symptoms / Reason for consultation
              </label>
              <textarea
                className="mt-2 w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                rows={5}
                placeholder="Describe your symptoms..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Confirm Booking
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}