import { NextRequest } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { dbConnect, collections } from "@/lib/dbConnect";
import {
  ApiResponse,
  withAuth,
  withValidation,
  withErrorHandling,
  compose,
} from "@/lib/api";

// ✅ Validation schemas
const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  age: z.number().min(1).max(150).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional(),
    })
    .optional(),
});

type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// ✅ GET: Get user profile
async function handleGetProfile(req: NextRequest, session: any) {
  const usersCollection = await dbConnect(collections.USERS);

  const user = await usersCollection.findOne({
    email: session.user.email.toLowerCase(),
  });

  if (!user) {
    return ApiResponse.notFound("User");
  }

  // Remove sensitive data
  const { password, ...userWithoutPassword } = user as any;

  return ApiResponse.success(userWithoutPassword);
}

// ✅ PATCH: Update user profile
async function handleUpdateProfile(
  req: NextRequest,
  data: UpdateProfileData,
  session: any,
) {
  const usersCollection = await dbConnect(collections.USERS);

  const userId = new ObjectId(session.user.id);

  // Build update payload
  const updatePayload: any = {
    updatedAt: new Date(),
  };

  if (data.fullName) updatePayload.fullName = data.fullName;
  if (data.phone) updatePayload.phone = data.phone;
  if (data.gender) updatePayload.gender = data.gender;
  if (data.age) updatePayload.age = data.age;
  if (data.address) {
    updatePayload.address = {
      street: data.address.street || null,
      city: data.address.city || null,
      country: data.address.country || null,
      zipCode: data.address.zipCode || null,
    };
  }

  // Check if profile is now complete
  const user = await usersCollection.findOne({ _id: userId });

  if (user) {
    const isComplete = Boolean(
      (data.fullName || user.fullName) &&
      (data.phone || user.phone) &&
      (data.gender || user.gender) &&
      (data.age || user.age),
    );

    if (isComplete && !user.profileCompleted) {
      updatePayload.profileCompleted = true;
    }
  }

  // Update user
  const result = await usersCollection.findOneAndUpdate(
    { _id: userId },
    { $set: updatePayload },
    { returnDocument: "after" },
  );

  if (!result) {
    return ApiResponse.error("Failed to update profile");
  }

  // Remove sensitive data
  const { password, ...userWithoutPassword } = result as any;

  return ApiResponse.success(
    userWithoutPassword,
    "Profile updated successfully",
  );
}

// ✅ Export with middleware composition
export const GET = compose(withAuth, withErrorHandling)(handleGetProfile);

export const PATCH = compose(
  withAuth,
  withValidation(updateProfileSchema),
  withErrorHandling,
)(handleUpdateProfile);
