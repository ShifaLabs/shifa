// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail } from "../../../lib/user.service";
import { collections, dbConnect } from "../../../lib/dbConnect";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
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

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const usersCollection = await dbConnect(collections.USERS);

    const now = new Date();

    await usersCollection.insertOne({
      fullName: parsed.fullName,
      email,
      password: hashedPassword,
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

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 },
    );
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
