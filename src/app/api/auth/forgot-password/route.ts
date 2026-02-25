import { NextResponse } from "next/server";
import crypto from "crypto";
import { collections, dbConnect } from "@/lib/dbConnect";
import { sendEmail } from "@/lib/Email/sendEmail";
import { resetPasswordTemplate } from "@/lib/Email/resetPassword";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const usersCollection = await dbConnect(collections.USERS);

    const user = await usersCollection.findOne({ email });

    // Always return same response (security)
    if (!user) {
      return NextResponse.json({
        message: "If email exists, reset link sent.",
      });
    }

    // 1️⃣ Generate raw token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2️⃣ Hash token for DB storage
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 3️⃣ Expiry (15 minutes)
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

    // 4️⃣ Create reset URL (raw token)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // 5️⃣ Send email
    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordTemplate(resetUrl),
    });

    return NextResponse.json({
      message: "If email exists, reset link sent.",
    });
  } catch (error) {
    console.error("Forget password error:", error);

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
