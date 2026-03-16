"use client";

import { useEffect } from "react";

export default function DoctorDashboard() {
  useEffect(() => {
    const loadDoctorAppointments = async () => {
      try {
        const response = await fetch("/api/appointments/doctor", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to load doctor appointments:", data);
          return;
        }

        console.log("Doctor appointments data:", data);
      } catch (error) {
        console.error("Doctor appointments request failed:", error);
      }
    };

    loadDoctorAppointments();
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">
        Doctor Dashboard
      </h1>
      <p className="text-sm text-slate-500">
        Welcome! Manage your appointments, patients, and consultation schedule.
      </p>
    </section>
  );
}
