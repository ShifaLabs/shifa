"use server";

import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/lib/dbConnect";

interface ApproveDoctorlResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Helper function to serialize MongoDB documents for Client Components
 * Converts ObjectId and Date objects to strings
 */
function serializeDoc(doc: any): any {
  if (!doc) return doc;

  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      // Convert ObjectId to string
      if (
        value &&
        typeof value === "object" &&
        value._bsontype === "ObjectID"
      ) {
        return value.toString();
      }
      // Convert Date to ISO string
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }),
  );
}

/**
 * Helper to serialize arrays of documents
 */
function serializeDocs(docs: any[]): any[] {
  return docs.map((doc) => serializeDoc(doc));
}

/**
 * Server action to approve a doctor application
 * Call this from admin dashboard
 */
export async function approveDoctorAction(
  doctorId: string,
  approvedBy: string,
): Promise<ApproveDoctorlResult> {
  try {
    if (!ObjectId.isValid(doctorId)) {
      return {
        success: false,
        message: "Invalid doctor ID",
      };
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const usersCollection = await dbConnect(collections.USERS);
    const now = new Date();

    // Update doctor in doctors collection
    const result = await doctorsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(doctorId),
      },
      {
        $set: {
          approvalStatus: "approved",
          status: "active",
          isVerified: true,
          approvedBy,
          approvedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    // Create or update user account
    const doctor = result.value;
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
          profileImage: doctor.profileImage || null,
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

    return {
      success: true,
      message: `Doctor ${result.value.fullName} has been approved successfully!`,
      data: serializeDoc(result.value),
    };
  } catch (error) {
    console.error("Error approving doctor:", error);
    return {
      success: false,
      message: "Failed to approve doctor",
    };
  }
}

/**
 * Server action to reject a doctor application
 * Call this from admin dashboard
 */
export async function rejectDoctorAction(
  doctorId: string,
  reason: string,
): Promise<ApproveDoctorlResult> {
  try {
    if (!ObjectId.isValid(doctorId)) {
      return {
        success: false,
        message: "Invalid doctor ID",
      };
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const now = new Date();

    // Update doctor in doctors collection
    const result = await doctorsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(doctorId),
      },
      {
        $set: {
          approvalStatus: "rejected",
          status: "inactive",
          approvalReason: reason || "Application was not approved",
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    return {
      success: true,
      message: `Doctor ${result.value.fullName}'s application has been rejected.`,
      data: serializeDoc(result.value),
    };
  } catch (error) {
    console.error("Error rejecting doctor:", error);
    return {
      success: false,
      message: "Failed to reject doctor",
    };
  }
}

/**
 * Server action to get pending doctors
 * Call this from admin dashboard
 */
export async function getPendingDoctorsAction(
  page: number = 1,
  limit: number = 10,
) {
  try {
    const doctorsCollection = await dbConnect(collections.DOCTORS);

    const skip = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      doctorsCollection
        .find(
          {
            approvalStatus: "pending",
          },
          {
            projection: {
              password: 0,
            },
          },
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      doctorsCollection.countDocuments({
        approvalStatus: "pending",
      }),
    ]);

    return {
      success: true,
      data: serializeDocs(doctors),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching pending doctors:", error);
    return {
      success: false,
      message: "Failed to fetch pending doctors",
      data: [],
    };
  }
}

/**
 * Server action to get all doctors (approved, rejected, pending)
 */
export async function getAllDoctorsAction(
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
) {
  try {
    const doctorsCollection = await dbConnect(collections.DOCTORS);

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status) {
      filter.approvalStatus = status;
    }

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

    return {
      success: true,
      data: serializeDocs(doctors),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return {
      success: false,
      message: "Failed to fetch doctors",
      data: [],
    };
  }
}
