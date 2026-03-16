import { collections, dbConnect } from "./dbConnect";

let indexesInitialized = false;

export async function initializeIndexes() {
  if (indexesInitialized) return;

  const usersCollection = await dbConnect(collections.USERS);
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  await usersCollection.createIndex({ email: 1 }, { unique: true });
  await appointmentsCollection.createIndex({ doctor: 1 });
  await appointmentsCollection.createIndex({ patient: 1 });
  await appointmentsCollection.createIndex({ appointmentDate: 1 });
  await appointmentsCollection.createIndex(
    { "videoSession.callId": 1 },
    { sparse: true },
  );

  indexesInitialized = true;
}
