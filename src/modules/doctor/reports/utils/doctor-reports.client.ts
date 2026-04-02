import type {
  ApiEnvelope,
  DoctorReportsDurationPoint,
  DoctorReportsEarnings,
  DoctorReportsOverview,
  DoctorReportsRange,
  DoctorReportsStatusDistribution,
  DoctorReportsTopPatient,
  DoctorReportsTrendPoint,
} from "./doctor-reports.types";

function getErrorMessage<T>(payload: ApiEnvelope<T> | null, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  if (typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  return fallback;
}

async function fetchReportData<T>(
  url: string,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload?.success || !payload?.data) {
    throw new Error(getErrorMessage(payload || null, fallbackMessage));
  }

  return payload.data;
}

export async function fetchDoctorReportsOverview(range: DoctorReportsRange) {
  return fetchReportData<DoctorReportsOverview>(
    `/api/doctor/reports/overview?range=${range}`,
    "Failed to load reports overview.",
  );
}

export async function fetchDoctorReportsTrends(range: DoctorReportsRange) {
  return fetchReportData<{
    range: DoctorReportsRange;
    items: DoctorReportsTrendPoint[];
  }>(
    `/api/doctor/reports/trends?range=${range}`,
    "Failed to load consultation trends.",
  );
}

export async function fetchDoctorReportsEarnings(range: DoctorReportsRange) {
  return fetchReportData<DoctorReportsEarnings>(
    `/api/doctor/reports/earnings?range=${range}`,
    "Failed to load earnings chart.",
  );
}

export async function fetchDoctorReportsStatusDistribution(
  range: DoctorReportsRange,
) {
  return fetchReportData<DoctorReportsStatusDistribution>(
    `/api/doctor/reports/status-distribution?range=${range}`,
    "Failed to load status distribution.",
  );
}

export async function fetchDoctorReportsDuration(range: DoctorReportsRange) {
  return fetchReportData<{
    range: DoctorReportsRange;
    items: DoctorReportsDurationPoint[];
  }>(
    `/api/doctor/reports/duration?range=${range}`,
    "Failed to load consultation duration chart.",
  );
}

export async function fetchDoctorReportsTopPatients(range: DoctorReportsRange) {
  return fetchReportData<{
    range: DoctorReportsRange;
    items: DoctorReportsTopPatient[];
  }>(
    `/api/doctor/reports/top-patients?range=${range}`,
    "Failed to load top patients chart.",
  );
}
