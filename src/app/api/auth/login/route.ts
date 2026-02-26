import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { collections, dbConnect } from "@/lib/dbConnect";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 min

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const usersCollection = await dbConnect(collections.USERS);
  const user = await usersCollection.findOne({ email });

  if (!user) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  // 1️⃣ Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    return NextResponse.json(
      { message: "Account temporarily locked. Try later." },
      { status: 403 },
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const attempts = (user.loginAttempts || 0) + 1;

    const updateData: any = {
      loginAttempts: attempts,
    };

    if (attempts >= MAX_ATTEMPTS) {
      updateData.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  }

  // ✅ Successful login → reset attempts
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
