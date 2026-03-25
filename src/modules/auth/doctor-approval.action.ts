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

type ModerationAction = "suspend" | "ban" | "reactivate";

interface DoctorListOptions {
  search?: string;
  specialization?: string;
  moderationState?: "none" | "suspended" | "banned";
  sortBy?: "createdAt" | "fullName" | "specialization";
  sortOrder?: "asc" | "desc";
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

async function logDoctorAdminAction({
  adminId,
  doctorId,
  action,
  reason,
  metadata,
}: {
  adminId: string;
  doctorId: ObjectId;
  action: string;
  reason?: string;
  metadata?: Record<string, any>;
}) {
  const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);

  await auditCollection.insertOne({
    entityType: "doctor",
    entityId: doctorId,
    action,
    reason: reason || null,
    metadata: metadata || {},
    actorId: adminId,
    createdAt: new Date(),
  });
}

function buildSort(
  sortBy?: DoctorListOptions["sortBy"],
  sortOrder?: string,
): Record<string, 1 | -1> {
  const order: 1 | -1 = sortOrder === "asc" ? 1 : -1;

  if (sortBy === "fullName") {
    return { fullName: order, createdAt: -1 as 1 | -1 };
  }

  if (sortBy === "specialization") {
    return { specialization: order, createdAt: -1 as 1 | -1 };
  }

  return { createdAt: order };
}

async function applyModerationAction({
  adminId,
  doctorId,
  action,
  reason,
  durationDays,
}: {
  adminId: string;
  doctorId: string;
  action: ModerationAction;
  reason: string;
  durationDays?: number;
}): Promise<ApproveDoctorlResult> {
  if (!ObjectId.isValid(doctorId)) {
    return {
      success: false,
      message: "Invalid doctor ID",
    };
  }

  const doctorsCollection = await dbConnect(collections.DOCTORS);
  const usersCollection = await dbConnect(collections.USERS);

  const doctorObjectId = new ObjectId(doctorId);
  const now = new Date();
  const doctor = await doctorsCollection.findOne({ _id: doctorObjectId });

  if (!doctor) {
    return {
      success: false,
      message: "Doctor not found",
    };
  }

  const normalizedReason = reason.trim() || "No reason provided";
  const normalizedDuration =
    typeof durationDays === "number" && durationDays > 0 ? durationDays : null;
  const untilDate =
    action === "suspend" && normalizedDuration
      ? new Date(now.getTime() + normalizedDuration * 24 * 60 * 60 * 1000)
      : null;

  const moderationState =
    action === "reactivate"
      ? "none"
      : action === "suspend"
        ? "suspended"
        : "banned";
  const isBanned = action === "ban";

  const status =
    action === "reactivate"
      ? doctor.approvalStatus === "approved"
        ? "active"
        : "pending"
      : "inactive";

  const moderation = {
    state: moderationState,
    reason: action === "reactivate" ? null : normalizedReason,
    until: action === "suspend" ? untilDate : null,
    updatedAt: now,
    updatedBy: adminId,
  };

  await doctorsCollection.updateOne(
    { _id: doctorObjectId },
    {
      $set: {
        status,
        moderation,
        isBanned,
        updatedAt: now,
      },
    },
  );

  await usersCollection.updateMany(
    {
      $or: [{ doctorId: doctorObjectId }, { email: doctor.email }],
    },
    {
      $set: {
        status,
        isBanned,
        moderation,
        updatedAt: now,
      },
    },
  );

  await logDoctorAdminAction({
    adminId,
    doctorId: doctorObjectId,
    action: `doctor.${action}`,
    reason: normalizedReason,
    metadata: {
      durationDays: normalizedDuration,
      until: untilDate,
      previousStatus: doctor.status,
      previousModerationState: doctor?.moderation?.state || "none",
      nextStatus: status,
      nextModerationState: moderationState,
    },
  });

  const updatedDoctor = await doctorsCollection.findOne({
    _id: doctorObjectId,
  });

  return {
    success: true,
    message:
      action === "reactivate"
        ? `Doctor ${doctor.fullName} has been reactivated.`
        : action === "suspend"
          ? `Doctor ${doctor.fullName} has been suspended.`
          : `Doctor ${doctor.fullName} has been banned.`,
    data: serializeDoc(updatedDoctor),
  };
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
    if (auth.ok === false) {
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

    await logDoctorAdminAction({
      adminId,
      doctorId: doctorObjectId,
      action: "doctor.approve",
      reason: "Application approved",
    });

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
    if (auth.ok === false) {
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

    await logDoctorAdminAction({
      adminId: auth.adminId,
      doctorId: doctorObjectId,
      action: "doctor.reject",
      reason,
    });

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
    if (auth.ok === false) {
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
  status?: "pending" | "approved" | "rejected" | "active" | "inactive",
  options: DoctorListOptions = {},
) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
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
      if (status === "active" || status === "inactive") {
        filter.status = status;
      } else {
        filter.approvalStatus = status;
      }
    }

    if (options.specialization) {
      filter.specialization = options.specialization;
    }

    if (options.moderationState && options.moderationState !== "none") {
      filter["moderation.state"] = options.moderationState;
    }

    if (options.search?.trim()) {
      const escaped = options.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { licenseNumber: regex },
      ];
    }

    const [doctors, total] = await Promise.all([
      doctorsCollection
        .find(filter, {
          projection: {
            password: 0,
          },
        })
        .sort(buildSort(options.sortBy, options.sortOrder))
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

export async function moderateDoctorAction(
  doctorId: string,
  action: ModerationAction,
  reason: string,
  durationDays?: number,
): Promise<ApproveDoctorlResult> {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return auth.error;
    }

    if (!reason?.trim() && action !== "reactivate") {
      return {
        success: false,
        message: "Reason is required for this action",
      };
    }

    return applyModerationAction({
      adminId: auth.adminId,
      doctorId,
      action,
      reason: reason || "Reactivated by admin",
      durationDays,
    });
  } catch (error) {
    console.error("Error moderating doctor:", error);
    return {
      success: false,
      message: "Failed to process doctor moderation action",
    };
  }
}

export async function bulkModerateDoctorsAction(
  doctorIds: string[],
  action: ModerationAction,
  reason: string,
  durationDays?: number,
) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        results: [],
      };
    }

    const uniqueDoctorIds = Array.from(new Set(doctorIds)).filter((id) =>
      ObjectId.isValid(id),
    );

    if (uniqueDoctorIds.length === 0) {
      return {
        success: false,
        message: "No valid doctor IDs provided",
        results: [],
      };
    }

    const results: Array<{
      doctorId: string;
      success: boolean;
      message: string;
    }> = [];

    for (const doctorId of uniqueDoctorIds) {
      const result = await applyModerationAction({
        adminId: auth.adminId,
        doctorId,
        action,
        reason,
        durationDays,
      });

      results.push({
        doctorId,
        success: result.success,
        message: result.message,
      });
    }

    const successCount = results.filter((item) => item.success).length;

    return {
      success: successCount > 0,
      message: `${successCount} of ${results.length} doctors updated.`,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: results.length - successCount,
      },
    };
  } catch (error) {
    console.error("Error in bulk moderation:", error);
    return {
      success: false,
      message: "Failed to process bulk moderation action",
      results: [],
    };
  }
}

export async function getDoctorAuditTrailAction(
  doctorId: string,
  limit: number = 20,
) {
  try {
    const auth = await requireAdminSession();
    if (auth.ok === false) {
      return {
        success: false,
        message: auth.error.message,
        data: [],
      };
    }

    if (!ObjectId.isValid(doctorId)) {
      return {
        success: false,
        message: "Invalid doctor ID",
        data: [],
      };
    }

    const auditCollection = await dbConnect(collections.ADMIN_AUDIT_LOGS);
    const normalizedLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;

    const entries = await auditCollection
      .find({
        entityType: "doctor",
        entityId: new ObjectId(doctorId),
      })
      .sort({ createdAt: -1 })
      .limit(normalizedLimit)
      .toArray();

    return {
      success: true,
      data: serializeDocs(entries),
    };
  } catch (error) {
    console.error("Error fetching doctor audit trail:", error);
    return {
      success: false,
      message: "Failed to fetch doctor audit trail",
      data: [],
    };
  }
}
