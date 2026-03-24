import { NextRequest, NextResponse } from "next/server";
import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import { getAdminOverviewAnalytics } from "@/modules/admin/analytics/analytics.service";

async function handleGetOverview(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get("range") || "mtd";
  const analytics = await getAdminOverviewAnalytics(range);

  return NextResponse.json(
    {
      success: true,
      message: "Admin overview analytics fetched",
      data: analytics,
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "public, max-age=60, s-maxage=300, stale-while-revalidate=300",
      },
    },
  );
}

export const GET = compose(
  withErrorHandling,
  withRole("admin"),
  withRateLimit(120, 60_000),
)(handleGetOverview);
