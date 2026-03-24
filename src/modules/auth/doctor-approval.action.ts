"use server";

import { authOptions } from "@/infrastructure/auth/auth.config";
import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getServerSession } from "next-auth";

interface ApproveDoctorlResult {
  success: boolean;
  message: string;
  data?: any;
}

type AdminGuardResult =
  | { ok: true; adminId: string }
  | { ok: false; error: ApproveDoctorlResult };

async function requireAdminSession(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      error: {
        success: false,
        message: "Authentication required",
      },
    };
  }

  if (session.user.role !== "admin") {
    return {
      ok: false,
      error: {
        success: false,
        message: "Access denied",
      },
    };
  }

  return {
    ok: true,
    adminId: session.user.id,
  };
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
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => serializeDoc(doc));
}

async function getDoctorAvailabilityMap(doctorIds: ObjectId[]) {
  if (doctorIds.length === 0) return new Map<string, any[]>();

  const doctorAvailabilitiesCollection = await dbConnect(
    collections.DOCTOR_AVAILABILITIES,
  );

  const availabilities = await doctorAvailabilitiesCollection
    .find({
      doctorId: { $in: doctorIds },
      isActive: true,
    })
    .sort({ dayOfWeek: 1 })
    .toArray();

  const availabilityMap = new Map<string, any[]>();
  for (const availability of availabilities) {
    const id = availability.doctorId?.toString();
    if (!id) continue;
    if (!availabilityMap.has(id)) {
      availabilityMap.set(id, []);
    }
    availabilityMap.get(id)!.push(availability);
  }

  return availabilityMap;
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
    const auth = await requireAdminSession();
    if (!auth.ok) {
      return auth.error;
    }

    if (!ObjectId.isValid(doctorId)) {
      return {
        success: false,
        message: "Invalid doctor ID",
      };
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const usersCollection = await dbConnect(collections.USERS);
    const now = new Date();
    const adminId = auth.adminId || approvedBy;

    const doctorObjectId = new ObjectId(doctorId);
    const existingDoctor = await doctorsCollection.findOne({
      _id: doctorObjectId,
    });

    if (!existingDoctor) {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    if (existingDoctor.approvalStatus === "approved") {
      return {
        success: true,
        message: `Doctor ${existingDoctor.fullName} is already approved.`,
        data: serializeDoc(existingDoctor),
      };
    }

    // Update doctor in doctors collection
    await doctorsCollection.findOneAndUpdate(
      { _id: doctorObjectId },
      {
        $set: {
          approvalStatus: "approved",
          status: "active",
          isVerified: true,
          approvedBy: adminId,
          approvedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after" },
    );

    const updatedDoctor = await doctorsCollection.findOne({
      _id: doctorObjectId,
    });

    if (!updatedDoctor) {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    // Create or update user account
    const doctor = updatedDoctor;
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
          doctorId: doctorObjectId,
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
      message: `Doctor ${doctor.fullName} has been approved successfully!`,
      data: serializeDoc(doctor),
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
    const auth = await requireAdminSession();
    if (!auth.ok) {
      return auth.error;
    }

    if (!ObjectId.isValid(doctorId)) {
      return {
        success: false,
        message: "Invalid doctor ID",
      };
    }

    const doctorsCollection = await dbConnect(collections.DOCTORS);
    const now = new Date();

    const doctorObjectId = new ObjectId(doctorId);
    const existingDoctor = await doctorsCollection.findOne({
      _id: doctorObjectId,
    });

    if (!existingDoctor) {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    if (existingDoctor.approvalStatus === "rejected") {
      return {
        success: true,
        message: `Doctor ${existingDoctor.fullName} is already rejected.`,
        data: serializeDoc(existingDoctor),
      };
    }

    // Update doctor in doctors collection
    await doctorsCollection.findOneAndUpdate(
      { _id: doctorObjectId },
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

    const updatedDoctor = await doctorsCollection.findOne({
      _id: doctorObjectId,
    });

    if (!updatedDoctor) {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    return {
      success: true,
      message: `Doctor ${updatedDoctor.fullName}'s application has been rejected.`,
      data: serializeDoc(updatedDoctor),
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
    const auth = await requireAdminSession();
    if (!auth.ok) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
      };
    }

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

    const doctorIds = doctors
      .map((doctor) => doctor._id)
      .filter((id): id is ObjectId => ObjectId.isValid(id));

    const availabilityMap = await getDoctorAvailabilityMap(doctorIds);

    const enrichedDoctors = doctors.map((doctor) => {
      const availability = availabilityMap.get(doctor._id.toString()) || [];
      const availableDays =
        Array.isArray(doctor.availableDays) && doctor.availableDays.length > 0
          ? doctor.availableDays
          : availability
              .map((slot) => slot.dayOfWeek)
              .filter((day) => typeof day === "number");

      const firstSlot = availability[0];

      return {
        ...doctor,
        availableDays,
        startTime: doctor.startTime || firstSlot?.startTime || null,
        endTime: doctor.endTime || firstSlot?.endTime || null,
        slotDuration: doctor.slotDuration || firstSlot?.slotDuration || null,
      };
    });

    return {
      success: true,
      data: serializeDocs(enrichedDoctors),
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
    const auth = await requireAdminSession();
    if (!auth.ok) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
      };
    }

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
