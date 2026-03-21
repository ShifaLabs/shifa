"use client";

import { useState } from "react";
import DoctorPatientCard from "@/components/Dashboard/Doctor/DoctorPatientCard";

export default function PatientsTabs({ activePatients, pastPatients }) {
  const [tab, setTab] = useState("active");

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-base-300">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-base-content"
          }`}
        >
          Active Patients
        </button>

        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            tab === "past"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-base-content"
          }`}
        >
          Past Patients
        </button>
      </div>
      {/* Active Patients */}
      {tab === "active" && (
        <>
          {activePatients.length === 0 ? (
            <div className="bg-base-100 p-8 rounded-2xl shadow text-center">
              <p className="text-gray-500 text-sm">
                No upcoming appointments with patients.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activePatients.map((patient) => (
                <DoctorPatientCard
                  key={patient._id.toString()}
                  patient={{
                    ...patient,
                    _id: patient._id.toString(),
                  }}
                  type="active"
                />
              ))}
            </div>
          )}
        </>
      )}
      {/* Past Patients */}
      {tab === "past" && (
        <>
          {pastPatients.length === 0 ? (
            <div className="bg-base-100 p-8 rounded-2xl shadow text-center">
              <p className="text-gray-500 text-sm">
                No past patient visits yet.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pastPatients.map((patient) => (
                <DoctorPatientCard
                  key={patient._id.toString()}
                  patient={{
                    ...patient,
                    _id: patient._id.toString(),
                  }}
                  type="past"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
