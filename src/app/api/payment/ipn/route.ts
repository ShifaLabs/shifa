import { NextRequest, NextResponse } from "next/server";
import { confirmPaymentByTransactionId } from "@/modules/payment/payment.service";

function getString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

async function parsePayload(
  request: NextRequest,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return body && typeof body === "object" ? body : {};
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData().catch(() => null);
    return formData ? Object.fromEntries(formData.entries()) : {};
  }

  const rawBody = await request.text().catch(() => "");
  if (!rawBody) return {};

  const params = new URLSearchParams(rawBody);
  if (Array.from(params.keys()).length > 0) {
    return Object.fromEntries(params.entries());
  }

  try {
    const parsed = JSON.parse(rawBody);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parsePayload(request);
    const transactionId =
      getString(payload.tran_id) ||
      getString(payload.transaction_id) ||
      getString(payload.val_id);

    const status = (
      getString(payload.status) ||
      getString(payload.payment_status) ||
      ""
    ).toUpperCase();

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing transaction id",
        },
        { status: 400 },
      );
    }

    if (status === "VALID" || status === "VALIDATED" || status === "SUCCESS") {
      const confirmed = await confirmPaymentByTransactionId(transactionId);

      if (!confirmed) {
        return NextResponse.json(
          {
            success: false,
            message: "Transaction not found",
            transactionId,
          },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payment confirmed",
        transactionId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "IPN received",
      transactionId,
      status: status || "UNKNOWN",
    });
  } catch (error) {
    console.error("Payment IPN processing failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "IPN processing failed",
      },
      { status: 500 },
    );
  }
}
