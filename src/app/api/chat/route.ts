import { NextResponse } from "next/server";
import { handleChat } from "@/modules/chatbot/chatbot.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";

    if (!message || message.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a symptom message with at least 5 characters",
        },
        { status: 400 },
      );
    }

    const result = await handleChat(message);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/chat failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process chat request",
      },
      { status: 500 },
    );
  }
}
