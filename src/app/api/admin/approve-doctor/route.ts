import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { collections, dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth/next";

const approvalSchema = z.object({
  doctorId: z.string(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

type ApprovalRequest = z.infer<typeof approvalSchema>;

/**
 * POST /api/admin/approve-doctor
 * Admin endpoint to approve or reject doctor applications
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify admin

    // TODO: Implement authentication check
    // const session = await getServerSession();
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { doctorId, action, reason } = approvalSchema.parse(body);

    // Validate ObjectId
    if (!ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID" },
        { status: 400 },
      );
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const usersCollection = await dbConnect(collections.USERS);
    const now = new Date();

    // Find the doctor in doctors collection
    const doctor = await doctorsCollection.findOne({
      _id: new ObjectId(doctorId),
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, message: "Doctor not found" },
        { status: 404 },
      );
    }

    if (action === "approve") {
      // Approve the doctor in doctors collection
      const result = await doctorsCollection.findOneAndUpdate(
        { _id: new ObjectId(doctorId) },
        {
          $set: {
            approvalStatus: "approved",
            status: "active",
            isVerified: true,
            approvedBy: "admin",
            approvedAt: now,
            updatedAt: now,
          },
        },
        { returnDocument: "after" },
      );

      // Create or update user account in users collection
      await usersCollection.updateOne(
        { email: doctor.email },
        {
          $set: {
            fullName: doctor.fullName,
            email: doctor.email,
            password: doctor.password,
            role: "doctor",
            phone: doctor.phone,
            gender: doctor.gender,
            age: doctor.age,
            address: doctor.address,
            profileImage: doctor.profileImage,
            provider: "credentials",
            isVerified: true,
            status: "active",
            profileCompleted: true,
            doctorId: new ObjectId(doctorId),
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      );

      return NextResponse.json(
        {
          success: true,
          message: `Doctor ${doctor.fullName} has been approved successfully!`,
          data: {
            doctorId,
            status: "approved",
            approvalStatus: "approved",
          },
        },
        { status: 200 },
      );
    } else if (action === "reject") {
      // Reject the doctor in doctors collection
      const result = await doctorsCollection.findOneAndUpdate(
        { _id: new ObjectId(doctorId) },
        {
          $set: {
            approvalStatus: "rejected",
            status: "inactive",
            approvalReason: reason || "No reason provided",
            updatedAt: now,
          },
        },
        { returnDocument: "after" },
      );

      return NextResponse.json(
        {
          success: true,
          message: `Doctor ${doctor.fullName} application has been rejected.`,
          data: {
            doctorId,
            status: "rejected",
            approvalStatus: "rejected",
            reason: reason || "No reason provided",
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
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

    console.error("Error in approve-doctor:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process approval",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/admin/approve-doctor?status=pending
 * Get list of doctors pending approval
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = Number(searchParams.get("page") || "1");
    const limit = Number(searchParams.get("limit") || "10");

    const doctorsCollection = await dbConnect(collections.DOCTORS);

    // Build filter
    const filter: any = {};

    if (status === "pending") {
      filter.approvalStatus = "pending";
    } else if (status === "approved") {
      filter.approvalStatus = "approved";
    } else if (status === "rejected") {
      filter.approvalStatus = "rejected";
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch doctors from doctors collection
    const [doctors, total] = await Promise.all([
      doctorsCollection
        .find(filter, {
          projection: {
            password: 0, // Exclude sensitive data
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      doctorsCollection.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: doctors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctors",
      },
      { status: 500 },
    );
  }
}
