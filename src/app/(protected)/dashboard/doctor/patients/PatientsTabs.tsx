"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorPatientCard from "@/modules/dashboard/components/Doctor/DoctorPatientCard";
import type { DoctorCommunicationPatient } from "@/modules/patient/types/doctor-patient.types";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

type Props = {
  activePatients: DoctorCommunicationPatient[];
  pastPatients: DoctorCommunicationPatient[];
};

type ReminderFilter = "all" | "overdue" | "due" | "upcoming" | "none";
type ConsultationFilter = "all" | "video" | "in-person" | "unknown";
type SortBy =
  | "time-asc"
  | "time-desc"
  | "name-asc"
  | "name-desc"
  | "reminder-priority";

function normalizeText(value?: string | null) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function getPatientTime(
  patient: DoctorCommunicationPatient,
  tab: "active" | "past",
) {
  const source = tab === "active" ? patient.nextAppointment : patient.lastVisit;
  if (!source) return 0;
  const parsed = new Date(source).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getReminderState(patient: DoctorCommunicationPatient): ReminderFilter {
  const overdue = patient.followUpOverdueCount || 0;
  const due = patient.followUpDueCount || 0;

  if (overdue > 0) return "overdue";
  if (due > 0) return "due";

  if (patient.nextFollowUpAt) {
    const date = new Date(patient.nextFollowUpAt).getTime();
    if (!Number.isNaN(date) && date > Date.now()) {
      return "upcoming";
    }
  }

  return "none";
}

export default function PatientsTabs({ activePatients, pastPatients }: Props) {
  const [tab, setTab] = useState("active");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [consultationFilter, setConsultationFilter] =
    useState<ConsultationFilter>("all");
  const [reminderFilter, setReminderFilter] = useState<ReminderFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("time-asc");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(searchInput.trim().toLowerCase());
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const selectedTab = tab === "past" ? "past" : "active";

  const sourcePatients = useMemo(
    () => (selectedTab === "active" ? activePatients : pastPatients),
    [activePatients, pastPatients, selectedTab],
  );

  const filteredPatients = useMemo(() => {
    const items = sourcePatients.filter((patient) => {
      if (searchTerm) {
        const patientBlob = [
          patient.fullName,
          patient.email,
          patient.phone,
          patient.lastSymptoms,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!patientBlob.includes(searchTerm)) {
          return false;
        }
      }

      if (consultationFilter !== "all") {
        const type = normalizeText(patient.lastConsultationType);

        if (consultationFilter === "video" && type !== "video") {
          return false;
        }

        if (
          consultationFilter === "in-person" &&
          ["video", "", "unknown", "n/a"].includes(type)
        ) {
          return false;
        }

        if (
          consultationFilter === "unknown" &&
          !["", "unknown", "n/a"].includes(type)
        ) {
          return false;
        }
      }

      if (reminderFilter !== "all") {
        const state = getReminderState(patient);
        if (state !== reminderFilter) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...items];

    sorted.sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.fullName.localeCompare(b.fullName);
      }

      if (sortBy === "name-desc") {
        return b.fullName.localeCompare(a.fullName);
      }

      if (sortBy === "time-desc") {
        return getPatientTime(b, selectedTab) - getPatientTime(a, selectedTab);
      }

      if (sortBy === "reminder-priority") {
        const rank = (patient: DoctorCommunicationPatient) => {
          const state = getReminderState(patient);
          if (state === "overdue") return 0;
          if (state === "due") return 1;
          if (state === "upcoming") return 2;
          return 3;
        };

        const priorityDiff = rank(a) - rank(b);
        if (priorityDiff !== 0) return priorityDiff;
        return getPatientTime(a, selectedTab) - getPatientTime(b, selectedTab);
      }

      return getPatientTime(a, selectedTab) - getPatientTime(b, selectedTab);
    });

    return sorted;
  }, [
    consultationFilter,
    reminderFilter,
    searchTerm,
    selectedTab,
    sortBy,
    sourcePatients,
  ]);

  const reminderSummary = useMemo(() => {
    return sourcePatients.reduce(
      (acc, patient) => {
        const state = getReminderState(patient);
        acc[state] += 1;
        return acc;
      },
      {
        overdue: 0,
        due: 0,
        upcoming: 0,
        none: 0,
      } as Record<Exclude<ReminderFilter, "all">, number>,
    );
  }, [sourcePatients]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-base-300">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            selectedTab === "active"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-base-content"
          }`}
        >
          Active Patients
        </button>

        <button
          onClick={() => setTab("past")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            selectedTab === "past"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-base-content"
          }`}
        >
          Past Patients
        </button>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          placeholder="Search name, email, phone, symptom..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <Select
          value={consultationFilter}
          onValueChange={(value) =>
            setConsultationFilter(value as ConsultationFilter)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Consultation type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All consultation types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="in-person">In-person</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={reminderFilter}
          onValueChange={(value) => setReminderFilter(value as ReminderFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Follow-up reminders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reminders</SelectItem>
            <SelectItem value="overdue">Overdue follow-up</SelectItem>
            <SelectItem value="due">Due now</SelectItem>
            <SelectItem value="upcoming">Upcoming follow-up</SelectItem>
            <SelectItem value="none">No reminder</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortBy)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time-asc">
              {selectedTab === "active"
                ? "Nearest appointment"
                : "Recent visits"}
            </SelectItem>
            <SelectItem value="time-desc">
              {selectedTab === "active"
                ? "Farthest appointment"
                : "Oldest visits"}
            </SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="reminder-priority">Reminder priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border px-3 py-1">
          Total: {sourcePatients.length}
        </span>
        <span className="rounded-full border px-3 py-1">
          Overdue: {reminderSummary.overdue}
        </span>
        <span className="rounded-full border px-3 py-1">
          Due: {reminderSummary.due}
        </span>
        <span className="rounded-full border px-3 py-1">
          Upcoming: {reminderSummary.upcoming}
        </span>
        <span className="rounded-full border px-3 py-1">
          Showing: {filteredPatients.length}
        </span>
      </div>

      {/* Active Patients */}
      {selectedTab === "active" && (
        <>
          {filteredPatients.length === 0 ? (
            <div className="bg-base-100 p-8 rounded-2xl shadow text-center">
              <p className="text-gray-500 text-sm">
                No active patients match your filters.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPatients.map((patient) => (
                <DoctorPatientCard
                  key={patient._id}
                  patient={{
                    ...patient,
                    _id: patient._id,
                  }}
                  type="active"
                />
              ))}
            </div>
          )}
        </>
      )}
      {/* Past Patients */}
      {selectedTab === "past" && (
        <>
          {filteredPatients.length === 0 ? (
            <div className="bg-base-100 p-8 rounded-2xl shadow text-center">
              <p className="text-gray-500 text-sm">
                No past patients match your filters.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredPatients.map((patient) => (
                <DoctorPatientCard
                  key={patient._id}
                  patient={{
                    ...patient,
                    _id: patient._id,
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
