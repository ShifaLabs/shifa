import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

const approvalSchema = z.object({
  doctorId: z.string(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function approveDoctorApplication(request: NextRequest) {
  try {
    const body = await request.json();
    const { doctorId, action, reason } = approvalSchema.parse(body);

    if (!ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { success: false, message: "Invalid doctor ID" },
        { status: 400 },
      );
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const usersCollection = await dbConnect(collections.USERS);
    const now = new Date();

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
      if (doctor.approvalStatus === "approved") {
        return NextResponse.json(
          {
            success: true,
            message: `Doctor ${doctor.fullName} is already approved.`,
            data: {
              doctorId,
              status: "approved",
              approvalStatus: "approved",
            },
          },
          { status: 200 },
        );
      }

      await doctorsCollection.updateOne(
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
      );

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
    }

    if (doctor.approvalStatus === "rejected") {
      return NextResponse.json(
        {
          success: true,
          message: `Doctor ${doctor.fullName} is already rejected.`,
          data: {
            doctorId,
            status: "rejected",
            approvalStatus: "rejected",
            reason: doctor.approvalReason || reason || "No reason provided",
          },
        },
        { status: 200 },
      );
    }

    await doctorsCollection.updateOne(
      { _id: new ObjectId(doctorId) },
      {
        $set: {
          approvalStatus: "rejected",
          status: "inactive",
          approvalReason: reason || "No reason provided",
          updatedAt: now,
        },
      },
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

export async function listDoctorApprovals(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(searchParams.get("limit") || "10");
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const filter: any = {};

    if (status === "pending") {
      filter.approvalStatus = "pending";
    } else if (status === "approved") {
      filter.approvalStatus = "approved";
    } else if (status === "rejected") {
      filter.approvalStatus = "rejected";
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid status filter" },
        { status: 400 },
      );
    }

    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      doctorsCollection
        .find(filter, {
          projection: {
            password: 0,
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
