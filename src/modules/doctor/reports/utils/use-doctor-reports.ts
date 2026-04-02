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
  DoctorReportsEarningsPoint,
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
  grossEarnings: 0,
  doctorEarnings: 0,
  platformEarnings: 0,
  doctorShareRate: 0.8,
  platformShareRate: 0.2,
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

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeOverview(
  payload: Partial<DoctorReportsOverview> | null | undefined,
): DoctorReportsOverview {
  const data = payload || {};
  return {
    totalAppointments: toNumber(data.totalAppointments),
    completed: toNumber(data.completed),
    cancelled: toNumber(data.cancelled),
    noShow: toNumber(data.noShow),
    totalEarnings: toNumber(data.totalEarnings),
    grossEarnings: toNumber(data.grossEarnings),
    doctorEarnings: toNumber(data.doctorEarnings, toNumber(data.totalEarnings)),
    platformEarnings: toNumber(data.platformEarnings),
    doctorShareRate: toNumber(data.doctorShareRate, 0.8),
    platformShareRate: toNumber(data.platformShareRate, 0.2),
    avgConsultationDuration: toNumber(data.avgConsultationDuration),
  };
}

function normalizeTrends(
  items: Array<Partial<DoctorReportsTrendPoint>> | null | undefined,
): DoctorReportsTrendPoint[] {
  return (items || []).map((item) => ({
    date: String(item?.date || ""),
    completed: toNumber(item?.completed),
    cancelled: toNumber(item?.cancelled),
    noShow: toNumber(item?.noShow),
  }));
}

function normalizeEarnings(
  payload: Partial<DoctorReportsEarnings> | null | undefined,
  range: DoctorReportsRange,
): DoctorReportsEarnings {
  const items = (
    (payload?.items || []) as Array<Partial<DoctorReportsEarningsPoint>>
  ).map((item) => {
    const doctorEarnings = toNumber(
      item?.doctorEarnings,
      toNumber(item?.earnings),
    );
    return {
      label: String(item?.label || ""),
      earnings: doctorEarnings,
      grossEarnings: toNumber(item?.grossEarnings),
      doctorEarnings,
      platformEarnings: toNumber(item?.platformEarnings),
    };
  });

  return {
    range: payload?.range || range,
    groupBy: payload?.groupBy === "week" ? "week" : "day",
    items,
  };
}

function normalizeStatusDistribution(
  payload: Partial<DoctorReportsStatusDistribution> | null | undefined,
  range: DoctorReportsRange,
): DoctorReportsStatusDistribution {
  const completed = toNumber(payload?.completed);
  const cancelled = toNumber(payload?.cancelled);
  const noShow = toNumber(payload?.noShow);
  const total = toNumber(payload?.total, completed + cancelled + noShow);

  const percentages = payload?.percentages || {
    completed: total > 0 ? (completed / total) * 100 : 0,
    cancelled: total > 0 ? (cancelled / total) * 100 : 0,
    noShow: total > 0 ? (noShow / total) * 100 : 0,
  };

  return {
    range: payload?.range || range,
    completed,
    cancelled,
    noShow,
    total,
    percentages: {
      completed: toNumber(percentages.completed),
      cancelled: toNumber(percentages.cancelled),
      noShow: toNumber(percentages.noShow),
    },
  };
}

function normalizeDuration(
  items: Array<Partial<DoctorReportsDurationPoint>> | null | undefined,
): DoctorReportsDurationPoint[] {
  return (items || []).map((item) => ({
    bucket: String(item?.bucket || ""),
    count: toNumber(item?.count),
  }));
}

function normalizeTopPatients(
  items: Array<Partial<DoctorReportsTopPatient>> | null | undefined,
): DoctorReportsTopPatient[] {
  return (items || []).map((item) => ({
    patientId: String(item?.patientId || ""),
    fullName: String(item?.fullName || "Unknown Patient"),
    email: String(item?.email || ""),
    visits: toNumber(item?.visits),
  }));
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
        setOverview({
          data: normalizeOverview(overviewResult.value),
          loading: false,
          error: "",
        });
      } else {
        setOverview((prev) => ({
          ...prev,
          loading: false,
          error: overviewResult.reason?.message || "Failed to load overview.",
        }));
      }

      if (trendsResult.status === "fulfilled") {
        setTrends({
          data: normalizeTrends(trendsResult.value.items),
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
          data: normalizeEarnings(earningsResult.value, range),
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
          data: normalizeStatusDistribution(distributionResult.value, range),
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
          data: normalizeDuration(durationResult.value.items),
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
          data: normalizeTopPatients(topPatientsResult.value.items),
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
