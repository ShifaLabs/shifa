import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth.config";
import { generateVideoToken } from "@/features/video/token.service";
import {
  getStreamApiKey,
  getStreamServerClient,
} from "@/features/video/stream.client";

// Demo call configuration
const DEMO_CALL_ID = "demo_consultation_test";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();

    // Initialize demo call
    if (action === "init") {
      const streamClient = getStreamServerClient() as any;
      const call = streamClient.video.call("default", DEMO_CALL_ID);

      try {
        // Try to get or create the call
        if (typeof call.getOrCreate === "function") {
          await call.getOrCreate({
            data: {
              created_by_id: session.user.id,
              members: [{ user_id: session.user.id }],
              custom: {
                demo: true,
                createdAt: new Date().toISOString(),
              },
            },
          });
        } else if (typeof call.create === "function") {
          await call.create({
            data: {
              created_by_id: session.user.id,
              members: [{ user_id: session.user.id }],
              custom: {
                demo: true,
                createdAt: new Date().toISOString(),
              },
            },
          });
        }
      } catch (error: any) {
        // Call might already exist, which is fine for demo
        console.log(
          "Demo call already exists or error creating:",
          error.message,
        );
      }

      return NextResponse.json({
        callId: DEMO_CALL_ID,
        message: "Demo call initialized",
      });
    }

    // Get token to join the call
    if (action === "join") {
      const token = generateVideoToken(session.user.id);
      const apiKey = getStreamApiKey();

      return NextResponse.json({
        apiKey,
        token,
        callId: DEMO_CALL_ID,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/video/demo failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      callId: DEMO_CALL_ID,
      user: {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("GET /api/video/demo failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
