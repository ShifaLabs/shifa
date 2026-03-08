import { NextResponse } from "next/server";
import {
  handleStreamWebhookEvent,
  validateStreamWebhookSignature,
} from "@/features/video/webhook.service";

function getSignature(headers: Headers) {
  return (
    headers.get("x-signature") ||
    headers.get("stream-signature") ||
    headers.get("x-stream-signature") ||
    headers.get("x-signature-256")
  );
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = getSignature(req.headers);

    if (!validateStreamWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const result = await handleStreamWebhookEvent(event);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("POST /api/video/webhook failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

