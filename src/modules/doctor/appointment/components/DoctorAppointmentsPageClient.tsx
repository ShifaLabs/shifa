"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import type {
  AppointmentTab,
  DoctorAppointment,
} from "../types/doctor-appointment.types";
import {
  APPOINTMENT_TABS,
  filterBySearch,
  filterByTab,
  sortAppointmentsByDate,
} from "../utils/doctor-appointment.utils";
import { fetchDoctorAppointments } from "../services/doctor-appointments.client";
import DoctorAppointmentTabs from "./DoctorAppointmentTabs";
import DoctorAppointmentFilters from "./DoctorAppointmentFilters";
import DoctorAppointmentsCards from "./DoctorAppointmentsCards";
import DoctorAppointmentsListSkeleton from "./DoctorAppointmentsListSkeleton";
import DoctorAppointmentsTable from "./DoctorAppointmentsTable";

const AUTO_REFRESH_MS = 45_000;

export default function DoctorAppointmentsPageClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [activeTab, setActiveTab] = useState<AppointmentTab>("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [consultationType, setConsultationType] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearchTerm(searchTerm.trim()),
      250,
    );
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const reloadAppointments = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const rows = await fetchDoctorAppointments();
      setAppointments(sortAppointmentsByDate(rows));
    } catch (requestError: any) {
      setError(requestError?.message || "Failed to load doctor appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadAppointments();
  }, [reloadAppointments, refreshTick]);

  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setRefreshTick((value) => value + 1);
    }, AUTO_REFRESH_MS);

    return () => clearInterval(refreshTimer);
  }, []);

  const tabCounts = useMemo(() => {
    return {
      today: filterByTab(appointments, "today").length,
      upcoming: filterByTab(appointments, "upcoming").length,
      completed: filterByTab(appointments, "completed").length,
      cancelled: filterByTab(appointments, "cancelled").length,
      "no-show": filterByTab(appointments, "no-show").length,
    };
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    const tabFiltered = filterByTab(appointments, activeTab);
    const searchFiltered = filterBySearch(tabFiltered, debouncedSearchTerm);

    if (consultationType === "all") {
      return searchFiltered;
    }

    return searchFiltered.filter(
      (item) => item.consultationType.toLowerCase() === consultationType,
    );
  }, [appointments, activeTab, debouncedSearchTerm, consultationType]);

  if (loading) {
    return <DoctorAppointmentsListSkeleton />;
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Doctor Appointments
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage consultations with responsive list views and quick actions.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRefreshTick((value) => value + 1)}
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Could not load appointments</AlertTitle>
          <AlertDescription>
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setRefreshTick((value) => value + 1)}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <DoctorAppointmentTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={tabCounts}
      />

      <Card>
        <CardContent className="space-y-4 px-4 py-4">
          <DoctorAppointmentFilters
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            consultationType={consultationType}
            onConsultationTypeChange={setConsultationType}
          />

          {visibleAppointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-base font-semibold">
                  No appointments in this view
                </p>
                <p className="text-sm text-muted-foreground">
                  Change tab or filters to see more records.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <DoctorAppointmentsTable
                appointments={visibleAppointments}
                onActionCompleted={reloadAppointments}
              />
              <DoctorAppointmentsCards
                appointments={visibleAppointments}
                onActionCompleted={reloadAppointments}
              />
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
