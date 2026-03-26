"use client";

import { useEffect, useState } from "react";
import {
  fetchDoctorReportsDuration,
  fetchDoctorReportsEarnings,
  fetchDoctorReportsOverview,
  fetchDoctorReportsStatusDistribution,
  fetchDoctorReportsTopPatients,
  fetchDoctorReportsTrends,
} from "./doctor-reports.client";
import type {
  DoctorReportsDurationPoint,
  DoctorReportsEarnings,
  DoctorReportsOverview,
  DoctorReportsRange,
  DoctorReportsStatusDistribution,
  DoctorReportsTopPatient,
  DoctorReportsTrendPoint,
  MetricState,
} from "./doctor-reports.types";

const emptyOverview: DoctorReportsOverview = {
  totalAppointments: 0,
  completed: 0,
  cancelled: 0,
  noShow: 0,
  totalEarnings: 0,
  avgConsultationDuration: 0,
};

const emptyEarnings: DoctorReportsEarnings = {
  range: "30d",
  groupBy: "day",
  items: [],
};

const emptyDistribution: DoctorReportsStatusDistribution = {
  range: "30d",
  completed: 0,
  cancelled: 0,
  noShow: 0,
  total: 0,
  percentages: {
    completed: 0,
    cancelled: 0,
    noShow: 0,
  },
};

function createMetricState<T>(data: T): MetricState<T> {
  return {
    data,
    loading: true,
    error: "",
  };
}

export function useDoctorReports(range: DoctorReportsRange) {
  const [overview, setOverview] = useState<MetricState<DoctorReportsOverview>>(
    createMetricState(emptyOverview),
  );
  const [trends, setTrends] = useState<MetricState<DoctorReportsTrendPoint[]>>(
    createMetricState([]),
  );
  const [earnings, setEarnings] = useState<MetricState<DoctorReportsEarnings>>(
    createMetricState(emptyEarnings),
  );
  const [statusDistribution, setStatusDistribution] = useState<
    MetricState<DoctorReportsStatusDistribution>
  >(createMetricState(emptyDistribution));
  const [duration, setDuration] = useState<
    MetricState<DoctorReportsDurationPoint[]>
  >(createMetricState([]));
  const [topPatients, setTopPatients] = useState<
    MetricState<DoctorReportsTopPatient[]>
  >(createMetricState([]));

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchDoctorReportsOverview(range),
      fetchDoctorReportsTrends(range),
      fetchDoctorReportsEarnings(range),
      fetchDoctorReportsStatusDistribution(range),
      fetchDoctorReportsDuration(range),
      fetchDoctorReportsTopPatients(range),
    ]).then((results) => {
      if (cancelled) return;

      const [
        overviewResult,
        trendsResult,
        earningsResult,
        distributionResult,
        durationResult,
        topPatientsResult,
      ] = results;

      if (overviewResult.status === "fulfilled") {
        setOverview({ data: overviewResult.value, loading: false, error: "" });
      } else {
        setOverview((prev) => ({
          ...prev,
          loading: false,
          error: overviewResult.reason?.message || "Failed to load overview.",
        }));
      }

      if (trendsResult.status === "fulfilled") {
        setTrends({
          data: trendsResult.value.items || [],
          loading: false,
          error: "",
        });
      } else {
        setTrends((prev) => ({
          ...prev,
          loading: false,
          error: trendsResult.reason?.message || "Failed to load trends.",
        }));
      }

      if (earningsResult.status === "fulfilled") {
        setEarnings({
          data: earningsResult.value,
          loading: false,
          error: "",
        });
      } else {
        setEarnings((prev) => ({
          ...prev,
          loading: false,
          error: earningsResult.reason?.message || "Failed to load earnings.",
        }));
      }

      if (distributionResult.status === "fulfilled") {
        setStatusDistribution({
          data: distributionResult.value,
          loading: false,
          error: "",
        });
      } else {
        setStatusDistribution((prev) => ({
          ...prev,
          loading: false,
          error:
            distributionResult.reason?.message ||
            "Failed to load status distribution.",
        }));
      }

      if (durationResult.status === "fulfilled") {
        setDuration({
          data: durationResult.value.items || [],
          loading: false,
          error: "",
        });
      } else {
        setDuration((prev) => ({
          ...prev,
          loading: false,
          error:
            durationResult.reason?.message ||
            "Failed to load consultation duration.",
        }));
      }

      if (topPatientsResult.status === "fulfilled") {
        setTopPatients({
          data: topPatientsResult.value.items || [],
          loading: false,
          error: "",
        });
      } else {
        setTopPatients((prev) => ({
          ...prev,
          loading: false,
          error:
            topPatientsResult.reason?.message || "Failed to load top patients.",
        }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return {
    overview,
    trends,
    earnings,
    statusDistribution,
    duration,
    topPatients,
  };
}
