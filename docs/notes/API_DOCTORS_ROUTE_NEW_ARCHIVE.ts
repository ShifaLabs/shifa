import { NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import {
  ApiResponse,
  withErrorHandling,
} from "@/infrastructure/lib/legacy/api";

// ✅ Validation schema
const getDoctorsSchema = z.object({
  specialization: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  page: z.coerce.number().min(1).default(1),
});

type GetDoctorsQuery = z.infer<typeof getDoctorsSchema>;

// ✅ GET: Get all doctors
async function handleGetDoctors(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Parse query params
  const query = getDoctorsSchema.parse({
    specialization: searchParams.get("specialization") || undefined,
    search: searchParams.get("search") || undefined,
    limit: searchParams.get("limit") || undefined,
    page: searchParams.get("page") || undefined,
  });

  const usersCollection = await dbConnect(collections.USERS);

  // Build filter
  const filter: any = {
    role: "doctor",
    isVerified: true,
    status: "active",
  };

  if (query.specialization) {
    filter.specialization = query.specialization;
  }

  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: "i" } },
      { specialization: { $regex: query.search, $options: "i" } },
    ];
  }

  // Calculate pagination
  const skip = (query.page - 1) * query.limit;

  // Fetch doctors with pagination
  const [doctors, total] = await Promise.all([
    usersCollection
      .find(filter, {
        projection: {
          password: 0, // Exclude password
        },
      })
      .skip(skip)
      .limit(query.limit)
      .toArray(),
    usersCollection.countDocuments(filter),
  ]);

  return ApiResponse.success({
    data: doctors,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  });
}

// ✅ GET: Get single doctor by ID
async function handleGetDoctor(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!ObjectId.isValid(params.id)) {
    return ApiResponse.error("Invalid doctor ID", 400);
  }

  const usersCollection = await dbConnect(collections.USERS);

  const doctor = await usersCollection.findOne(
    {
      _id: new ObjectId(params.id),
      role: "doctor",
      isVerified: true,
      status: "active",
    },
    {
      projection: { password: 0 },
    },
  );

  if (!doctor) {
    return ApiResponse.notFound("Doctor");
  }

  // Get doctor's availability
  const availabilityCollection = await dbConnect(
    collections.DOCTOR_AVAILABILITIES,
  );

  const availability = await availabilityCollection
    .find({
      doctorId: new ObjectId(params.id),
      isActive: true,
    })
    .toArray();

  return ApiResponse.success({
    ...doctor,
    availability,
  });
}

// ✅ Export with middleware
export const GET = withErrorHandling(handleGetDoctors);
