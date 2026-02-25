// app/api/verify-email/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections, dbConnect } from "@/lib/dbConnect";

const verifySchema = z.object({
  email: z.string().trim().email(),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.parse(body);
    console.log("parsed", parsed);
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

    // Always validate against the newest OTP record for this user.
    const verification = await verificationCollection.findOne(
      {
        $or: [{ userId: user._id }, { userId: user._id.toString() }],
      },
      {
        sort: { createdAt: -1, _id: -1 },
      },
    );

    console.log(`Verification requested for user: ${email} (${user._id})`);
    if (!verification) {
      console.log(`Verification record not found for user: ${user._id}`);
      return NextResponse.json(
        { message: "OTP not found or expired" },
        { status: 400 },
      );
    }

    console.log(
      `Verification record found. Attempts: ${verification.attempts}`,
    );

    // Expiry check
    if (new Date() > verification.expiresAt) {
      await verificationCollection.deleteOne({ _id: verification._id });

      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Attempt limit check
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

    // ✅ Success
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

    console.error("Verify Email Error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
