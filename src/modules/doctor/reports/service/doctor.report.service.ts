import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";
import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import {
  DateRange,
  DoctorReportsRangeKey,
  fetchDoctorReportsDuration,
  fetchDoctorReportsEarnings,
  fetchDoctorReportsOverview,
  fetchDoctorReportsStatusDistribution,
  fetchDoctorReportsTopPatients,
  fetchDoctorReportsTrends,
} from "./doctor.report.repository";

function parseRange(value: string | null | undefined): DoctorReportsRangeKey {
  if (value === "7d" || value === "30d" || value === "90d") {
    return value;
  }
  return "30d";
}

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function resolveDateRange(key: DoctorReportsRangeKey): DateRange {
  const now = new Date();
  const end = now;

  const dayCount = key === "7d" ? 7 : key === "90d" ? 90 : 30;
  const start = startOfUtcDay(
    new Date(now.getTime() - (dayCount - 1) * 24 * 60 * 60 * 1000),
  );

  return {
    key,
    start,
    end,
  };
}

function isValidObjectId(value: unknown) {
  return ObjectId.isValid(String(value || ""));
}

function resolveDoctorCandidateIds(session: any) {
  const doctorUserId = session?.user?.id;
  const doctorProfileId = (session?.user as any)?.doctorId || null;

  return Array.from(new Set([doctorProfileId, doctorUserId].filter(Boolean)));
}

function resolveDoctorScope(session: any) {
  const candidateIds = resolveDoctorCandidateIds(session)
    .filter((id) => isValidObjectId(id))
    .map((id) => new ObjectId(String(id)));

  return {
    doctorObjectIds: candidateIds,
    doctorIdStrings: candidateIds.map((id) => id.toString()),
  };
}

async function getDoctorSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      scope: null,
      error: ApiResponse.unauthorized("Unauthorized"),
    };
  }

  const scope = resolveDoctorScope(session);

  if (scope.doctorObjectIds.length === 0) {
    return {
      session,
      scope: null,
      error: ApiResponse.unauthorized("Missing authenticated doctor id"),
    };
  }

  return {
    session,
    scope,
    error: null,
  };
}

export async function handleGetDoctorReportsOverview(req: NextRequest) {
  const auth = await getDoctorSession();
  if (auth.error || !auth.scope) return auth.error;

  const range = resolveDateRange(
    parseRange(req.nextUrl.searchParams.get("range")),
  );
  const data = await fetchDoctorReportsOverview(auth.scope, range);

  return ApiResponse.success(
    data,
    "Doctor reports overview fetched successfully",
  );
}

export async function handleGetDoctorReportsTrends(req: NextRequest) {
  const auth = await getDoctorSession();
  if (auth.error || !auth.scope) return auth.error;

  const range = resolveDateRange(
    parseRange(req.nextUrl.searchParams.get("range")),
  );
  const items = await fetchDoctorReportsTrends(auth.scope, range);

  return ApiResponse.success(
    {
      range: range.key,
      items,
    },
    "Doctor reports trends fetched successfully",
  );
}

export async function handleGetDoctorReportsEarnings(req: NextRequest) {
  const auth = await getDoctorSession();
  if (auth.error || !auth.scope) return auth.error;

  const range = resolveDateRange(
    parseRange(req.nextUrl.searchParams.get("range")),
  );
  const data = await fetchDoctorReportsEarnings(auth.scope, range);

  return ApiResponse.success(
    {
      range: range.key,
      ...data,
    },
    "Doctor reports earnings fetched successfully",
  );
}

export async function handleGetDoctorReportsStatusDistribution(
  req: NextRequest,
) {
  const auth = await getDoctorSession();
  if (auth.error || !auth.scope) return auth.error;

  const range = resolveDateRange(
    parseRange(req.nextUrl.searchParams.get("range")),
  );
  const data = await fetchDoctorReportsStatusDistribution(auth.scope, range);

  return ApiResponse.success(
    {
      range: range.key,
      ...data,
    },
    "Doctor status distribution fetched successfully",
  );
}

export async function handleGetDoctorReportsDuration(req: NextRequest) {
  const auth = await getDoctorSession();
  if (auth.error || !auth.scope) return auth.error;

  const range = resolveDateRange(
    parseRange(req.nextUrl.searchParams.get("range")),
  );
  const items = await fetchDoctorReportsDuration(auth.scope, range);

  return ApiResponse.success(
    {
      range: range.key,
      items,
    },
    "Doctor consultation duration fetched successfully",
  );
}

export async function handleGetDoctorReportsTopPatients(req: NextRequest) {
  const auth = await getDoctorSession();
  if (auth.error || !auth.scope) return auth.error;

  const range = resolveDateRange(
    parseRange(req.nextUrl.searchParams.get("range")),
  );
  const items = await fetchDoctorReportsTopPatients(auth.scope, range);

  return ApiResponse.success(
    {
      range: range.key,
      items,
    },
    "Doctor top patients fetched successfully",
  );
}
