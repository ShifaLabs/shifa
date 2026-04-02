"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import DoctorDashboardSkeleton from "./DoctorDashboardSkeleton";
import {
  computeKpis,
  decorateAppointment,
  getNextPatient,
  matchesDateBucket,
  matchesSearch,
  matchesStatus,
  sortByAppointmentDateAsc,
} from "@/modules/doctor/home/service/doctor-dashboard.utils";
import KpiCards from "./KpiCards";
import FilterBar from "./FilterBar";
import QuickWidgets from "./QuickWidgets";
import AppointmentRow from "./AppointmentRow";
import EmptyState from "./EmptyState";

const REFRESH_INTERVAL_MS = 45_000;

export default function DoctorDashboardClient() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);
  const [nowTick, setNowTick] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const clock = setInterval(() => {
      setNowTick(new Date());
    }, 1000);

    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const refresh = setInterval(() => {
      setRefreshTick((value) => value + 1);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadDoctorAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/appointments/doctor", {
          method: "GET",
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(deriveErrorMessage(payload));
        }

        const rows = Array.isArray(payload?.data?.appointments)
          ? payload.data.appointments
          : [];

        const now = new Date();
        const decorated = rows.map((item) => decorateAppointment(item, now));

        if (!isCancelled) {
          setAppointments(sortByAppointmentDateAsc(decorated));
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(requestError?.message || "Failed to load doctor dashboard.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadDoctorAppointments();

    return () => {
      isCancelled = true;
    };
  }, [refreshTick]);

  const kpis = useMemo(() => computeKpis(appointments), [appointments]);

  const nextPatient = useMemo(
    () => getNextPatient(appointments, nowTick),
    [appointments, nowTick],
  );

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      return (
        matchesSearch(appointment, debouncedSearchTerm) &&
        matchesStatus(appointment, statusFilter) &&
        matchesDateBucket(appointment, dateFilter)
      );
    });
  }, [appointments, debouncedSearchTerm, statusFilter, dateFilter]);

  if (loading) {
    return <DoctorDashboardSkeleton />;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Doctor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor appointments, prepare consultations, and stay ahead of
            patient follow-ups.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshTick((value) => value + 1)}
          className="inline-flex items-center gap-2"
        >
          <RefreshCcw className="size-4" />
          Refresh
        </Button>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard load failed</AlertTitle>
          <AlertDescription>
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRefreshTick((value) => value + 1)}
              className="mt-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <KpiCards stats={kpis} />

      <QuickWidgets
        nextPatient={nextPatient}
        pendingConfirmations={kpis.pendingConfirmations}
        nowTick={nowTick}
      />

      <Card>
        <div className=" flex flex-col gap-4">
          <CardHeader>
            <CardTitle className="text-base">Appointments Overview</CardTitle>
            <CardDescription>
              Search and filter patient appointments by status and date bucket.
            </CardDescription>
            <FilterBar
              search={searchTerm}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              onSearch={setSearchTerm}
              onStatusChange={setStatusFilter}
              onDateChange={setDateFilter}
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <EmptyState />
            ) : (
              filteredAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment._id}
                  appointment={appointment}
                />
              ))
            )}
          </CardContent>
        </div>
      </Card>
    </section>
  );
}
