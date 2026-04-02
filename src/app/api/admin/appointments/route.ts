import { NextRequest, NextResponse } from "next/server";
import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import { getAllAppointmentsAction } from "@/modules/admin/services/appointments-admin.action";
import {
  AppointmentDateRange,
  AppointmentPaymentStatusFilter,
  AppointmentSortBy,
  AppointmentStatusFilter,
} from "@/modules/admin/types/appointment-admin.types";

async function handleGetAdminAppointments(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "12");
  const status =
    (searchParams.get("status") as AppointmentStatusFilter | null) || "all";
  const search = searchParams.get("search") || undefined;
  const paymentStatus =
    (searchParams.get(
      "paymentStatus",
    ) as AppointmentPaymentStatusFilter | null) || "all";
  const dateRange =
    (searchParams.get("dateRange") as AppointmentDateRange | null) || "all";
  const sortBy =
    (searchParams.get("sortBy") as AppointmentSortBy | null) ||
    "appointmentDate";
  const sortOrder =
    (searchParams.get("sortOrder") as "asc" | "desc" | null) || "desc";

  const result = await getAllAppointmentsAction(page, limit, status, {
    search,
    paymentStatus,
    dateRange,
    sortBy,
    sortOrder,
  });

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
    headers: {
      "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
    },
  });
}

export const GET = compose(
  withErrorHandling,
  withRole("admin"),
  withRateLimit(120, 60_000),
)(handleGetAdminAppointments);
