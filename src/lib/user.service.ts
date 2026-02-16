import { ObjectId } from "mongodb";
import { collections, dbConnect } from "./dbConnect";

/**
 * Find a user by email (Single source of truth)
 */
export async function findUserByEmail(email: string) {
  if (!email) return null;

  const usersCollection = await dbConnect(collections.USERS);
  return await usersCollection.findOne({ email });
}

/**
 * Create OAuth User (Initial minimal profile)
 * Full profile will be completed later
 */
export async function createOAuthUser({
  fullName,
  email,
  profileImage,
  role = "patient",
  provider,
}: {
  fullName?: string;
  email: string;
  profileImage?: string;
  role?: "patient" | "doctor";
  provider: string;
}) {
  if (!email) {
    throw new Error("Email is required to create OAuth user");
  }

  const usersCollection = await dbConnect(collections.USERS);

  const now = new Date();

  const userDoc = {
    fullName: fullName || null,
    email,
    role,
    provider,

    // Profile Info (nullable initially)
    phone: null,
    gender: null,
    age: null,
    address: {
      street: null,
      city: null,
      country: null,
      zipCode: null,
    },

    profileImage: profileImage || null,

    // System Controlled Fields
    status: "active",
    profileCompleted: false,

    createdAt: now,
    updatedAt: now,
  };

  const result = await usersCollection.insertOne(userDoc);

  return {
    ...userDoc,
    _id: result.insertedId as ObjectId,
  };
}
