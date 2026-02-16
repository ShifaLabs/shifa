import { collections, dbConnect } from "./dbConnect";

let indexesInitialized = false;

export async function initializeIndexes() {
  if (indexesInitialized) return;

  const usersCollection = await dbConnect(collections.USERS);

  await usersCollection.createIndex({ email: 1 }, { unique: true });

  indexesInitialized = true;
}
