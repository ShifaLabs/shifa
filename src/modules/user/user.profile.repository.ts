import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

export async function findUserProfileByEmail(email: string) {
  const usersCollection = await dbConnect(collections.USERS);

  return usersCollection.findOne({ email }, { projection: { password: 0 } });
}

export async function updateUserProfileByEmail(
  email: string,
  updateDoc: Record<string, unknown>,
) {
  const usersCollection = await dbConnect(collections.USERS);

  return usersCollection.updateOne({ email }, { $set: updateDoc });
}
