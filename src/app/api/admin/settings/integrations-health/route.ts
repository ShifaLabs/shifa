import { NextResponse } from "next/server";
import {
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/infrastructure/lib/legacy/api";
import { getAdminIntegrationsHealthAction } from "@/modules/admin/services/settings-admin.action";

async function handleGetIntegrationsHealth() {
  const result = await getAdminIntegrationsHealthAction();

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
    headers: {
      "Cache-Control": "private, max-age=10, stale-while-revalidate=20",
    },
  });
}

export const GET = compose(
  withErrorHandling,
  withRole("admin"),
  withRateLimit(60, 60_000),
)(handleGetIntegrationsHealth);
