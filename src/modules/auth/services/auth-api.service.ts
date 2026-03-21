import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import bcryptNode from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import { findUserByEmail } from "@/infrastructure/lib/legacy/user.service";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { sendEmail } from "@/infrastructure/lib/legacy/Email/sendEmail";
import verifyEmailTemplates from "@/infrastructure/lib/legacy/Email/verifyEmail";
import { resetPasswordTemplate } from "@/infrastructure/lib/legacy/Email/resetPassword";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(["patient", "doctor"]).default("patient"),
});

const verifySchema = z.object({
  email: z.string().trim().email(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export async function handleLoginRequest(req: Request) {
  const { email, password } = await req.json();

  const usersCollection = await dbConnect(collections.USERS);
  const user = await usersCollection.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  if (user.lockUntil && user.lockUntil > new Date()) {
    return NextResponse.json(
      { message: "Account temporarily locked. Try later." },
      { status: 403 },
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const attempts = (user.loginAttempts || 0) + 1;
    const updateData: any = { loginAttempts: attempts };

    if (attempts >= MAX_ATTEMPTS) {
      updateData.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        loginAttempts: 0,
        lockUntil: null,
      },
    },
  );

  return NextResponse.json({ message: "Login successful" });
}

export async function handleRegisterRequest(req: Request) {
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
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await verificationCollection.deleteMany({ userId });
    await verificationCollection.insertOne({
      userId,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      attempts: 0,
      createdAt: now,
    });

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: verifyEmailTemplates({ otp }),
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

export async function handleForgotPasswordRequest(req: Request) {
  try {
    const { email } = await req.json();
    const usersCollection = await dbConnect(collections.USERS);
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({
        message: "If email exists, reset link sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await usersCollection.updateOne(
      { email },
      {
        $set: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: expiry,
        },
      },
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordTemplate(resetUrl),
    });

    return NextResponse.json({ message: "If email exists, reset link sent." });
  } catch (error) {
    console.error("Forget password error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function handleResetPasswordRequest(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 },
      );
    }

    const usersCollection = await dbConnect(collections.USERS);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await usersCollection.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcryptNode.hash(newPassword, 12);

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
      },
    );

    return NextResponse.json({ message: "Password successfully reset." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}

export async function handleVerifyEmailRequest(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.parse(body);
    const email = parsed.email.toLowerCase();

    const usersCollection = await dbConnect(collections.USERS);
    const verificationCollection = await dbConnect(
      collections.EMAIL_VERIFICATIONS,
    );

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 400 },
      );
    }

    const verification = await verificationCollection.findOne(
      {
        $or: [{ userId: user._id }, { userId: user._id.toString() }],
      },
      {
        sort: { createdAt: -1, _id: -1 },
      },
    );

    if (!verification) {
      return NextResponse.json(
        { message: "OTP not found or expired" },
        { status: 400 },
      );
    }

    if (new Date() > verification.expiresAt) {
      await verificationCollection.deleteOne({ _id: verification._id });
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    if (verification.attempts >= 5) {
      return NextResponse.json(
        { message: "Too many attempts" },
        { status: 429 },
      );
    }

    const isMatch = await bcrypt.compare(parsed.otp, verification.otpHash);

    if (!isMatch) {
      await verificationCollection.updateOne(
        { _id: verification._id },
        { $inc: { attempts: 1 } },
      );

      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { isVerified: true, updatedAt: new Date() } },
    );

    await verificationCollection.deleteMany({
      $or: [{ userId: user._id }, { userId: user._id.toString() }],
    });

    return NextResponse.json({
      message: "Email verified successfully",
      verified: true,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input data" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
