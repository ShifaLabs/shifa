// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { findUserByEmail } from "@/lib/user.service";
import { collections, dbConnect } from "@/lib/dbConnect";
import { sendEmail } from "@/lib/Email/sendEmail";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(["patient", "doctor"]).default("patient"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.parse(body);

    const email = parsed.email.toLowerCase();

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const usersCollection = await dbConnect(collections.USERS);
    const verificationCollection = await dbConnect(
      collections.EMAIL_VERIFICATIONS,
    );

    const now = new Date();

    const userResult = await usersCollection.insertOne({
      fullName: parsed.fullName,
      email,
      password: hashedPassword,
      isVerified: false,
      role: parsed.role,
      provider: "credentials",

      phone: null,
      gender: null,
      age: null,
      address: {
        street: null,
        city: null,
        country: null,
        zipCode: null,
      },

      profileImage: null,
      status: "active",
      profileCompleted: false,

      createdAt: now,
      updatedAt: now,
    });

    const userId = userResult.insertedId;

    // 🔐 Generate secure OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Remove any previous OTP for safety
    await verificationCollection.deleteMany({ userId });

    // Store OTP
    await verificationCollection.insertOne({
      userId,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      createdAt: now,
    });
    console.log("OTP generated:", otp);
    // 📧 Send email
    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `Your verification code is ${otp}`,
    });

    return NextResponse.json(
      {
        message: "User registered successfully. Verification required.",
        requiresVerification: true,
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 },
      );
    }

    console.error("Register Error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
