import { NextRequest, NextResponse } from "next/server";
import { getDoctors } from "@/modules/appointment/appointments.doctors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "2 0");
    const specialization = searchParams.get("specialization") ?? undefined;
    const isVerifiedParam = searchParams.get("isVerified");
    const isVerified =
      isVerifiedParam === null ? undefined : isVerifiedParam === "true";

    const result = await getDoctors({
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
      specialization,
      isVerified,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/doctors failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 },
    );
  }
}
