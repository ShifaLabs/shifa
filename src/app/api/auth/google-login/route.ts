// app/api/google-login/route.ts
import { createOAuthUser, findUserByEmail } from "@/lib/user.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, image } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    let user = await findUserByEmail(normalizedEmail);

    if (!user) {
      // Create a new OAuth user
      user = await createOAuthUser({
        fullName: name || undefined,
        email: normalizedEmail,
        profileImage: image || undefined,
        provider: "google",
      });
    }

    return NextResponse.json(
      { message: "Google login successful", user },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Something went wrong", error: error.message },
      { status: 500 },
    );
  }
}
