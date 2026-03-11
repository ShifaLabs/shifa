import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { collections, dbConnect } from "@/lib/dbConnect";
import { findUserByEmail } from "@/lib/user.service";

const becomeDoctorSchema = z.object({
  // Personal Info
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  gender: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(18).max(100),

  // Location
  street: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().min(1),

  // Professional
  specialization: z.string().min(1),
  licenseNumber: z.string().min(5),

  // Availability & Billing
  consultationFee: z.coerce.number().min(0),
  availableDays: z.array(z.number()).min(1),
  startTime: z.string(),
  endTime: z.string(),
  slotDuration: z.coerce.number().min(15).max(120),
});

type BecomeDoctorRequest = z.infer<typeof becomeDoctorSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = becomeDoctorSchema.parse(body);
    const normalizedAvailableDays = Array.from(new Set(data.availableDays))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      .sort((a, b) => a - b);

    if (normalizedAvailableDays.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one valid available day is required",
        },
        { status: 400 },
      );
    }

    const email = data.email.toLowerCase();

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists with this email",
        },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Connect to database
    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const doctorAvailabilitiesCollection = await dbConnect(
      collections.DOCTOR_AVAILABILITIES,
    );
    const now = new Date();

    // Create doctor document with approval status in doctors collection
    const doctorResult = await doctorsCollection.insertOne({
      // Personal Info
      fullName: data.fullName,
      email,
      password: hashedPassword,
      phone: data.phone,
      gender: data.gender,
      age: data.age,

      // Address
      address: {
        street: data.street,
        city: data.city,
        country: data.country,
        zipCode: data.zipCode,
      },

      // Professional
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,

      // Billing
      consultationFee: data.consultationFee,

      // Availability summary (kept in doctor profile for faster dashboard reads)
      availableDays: normalizedAvailableDays,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: data.slotDuration,

      // Role & Status
      role: "doctor",
      provider: "credentials",
      isVerified: false,
      status: "pending", // Doctor is pending until approved
      profileCompleted: true,

      // Approval Fields
      approvalStatus: "pending",
      approvedBy: null,
      approvalReason: null,
      approvedAt: null,

      // Meta
      profileImage: null,
      createdAt: now,
      updatedAt: now,
    });

    // Store availability in doctorAvailabilities collection (one row per day)
    try {
      const availabilityDocs = normalizedAvailableDays.map((dayOfWeek) => ({
        doctorId: doctorResult.insertedId,
        dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        slotDuration: data.slotDuration,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }));

      await doctorAvailabilitiesCollection.insertMany(availabilityDocs);
    } catch (availabilityError) {
      // Prevent orphan doctor records when availability insert fails
      await doctorsCollection.deleteOne({ _id: doctorResult.insertedId });
      throw availabilityError;
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Application submitted successfully! Your profile is now pending admin approval.",
        data: {
          doctorId: doctorResult.insertedId,
          email: data.email,
          status: "pending",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    console.error("Error in become-doctor:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit application",
      },
      { status: 500 },
    );
  }
}
