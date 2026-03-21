import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

export async function findUserById(
  userId: string,
  projection?: Record<string, 0 | 1>,
) {
  const usersCollection = await dbConnect(collections.USERS);

  return usersCollection.findOne(
    { _id: new ObjectId(userId) },
    projection ? { projection } : undefined,
  );
}

export async function updateUserProfile(
  userId: string,
  updateData: Record<string, unknown>,
  expectedUpdatedAt?: Date | null,
) {
  const usersCollection = await dbConnect(collections.USERS);

  const filter: Record<string, unknown> = {
    _id: new ObjectId(userId),
  };

  if (expectedUpdatedAt) {
    filter.updatedAt = expectedUpdatedAt;
  }

  return usersCollection.findOneAndUpdate(
    filter,
    { $set: updateData },
    { returnDocument: "after" },
  );
}
