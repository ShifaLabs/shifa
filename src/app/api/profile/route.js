import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth.config";
import { dbConnect, collections } from "@/lib/dbConnect";

// ✅ GET: logged-in user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usersCollection = await dbConnect(collections.USERS);

    const user = await usersCollection.findOne(
      { email: session.user.email },
      { projection: { password: 0 } },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // serialize _id
    return NextResponse.json({
      ...user,
      _id: user._id?.toString?.() ?? null,
    });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ PATCH: update logged-in user profile
export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const usersCollection = await dbConnect(collections.USERS);

    const updateDoc = {
      fullName: body.fullName ?? "",
      phone: body.phone ?? "",
      gender: body.gender ?? "",
      age: body.age ?? "",
      address: {
        street: body.street ?? "",
        city: body.city ?? "",
        country: body.country ?? "",
        zipCode: body.zipCode ?? "",
      },
      updatedAt: new Date(),
    };

    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateDoc },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
