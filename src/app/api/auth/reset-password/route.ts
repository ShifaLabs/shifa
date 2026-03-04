import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { collections, dbConnect } from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 },
      );
    }

    const usersCollection = await dbConnect(collections.USERS);

    // 1️⃣ Hash the incoming token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2️⃣ Find user with valid token & expiry
    const user = await usersCollection.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // token not expired
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 },
      );
    }

    // 3️⃣ Hash the new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 4️⃣ Update password & remove reset token fields
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
