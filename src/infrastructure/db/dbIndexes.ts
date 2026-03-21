import { collections, dbConnect } from "./dbConnect";

let indexesInitialized = false;

async function createIndexSafe(
  createIndexCall: Promise<string>,
  label: string,
) {
  try {
    await createIndexCall;
  } catch (error: any) {
    console.warn(
      `Index creation skipped for ${label}:`,
      error?.message || error,
    );
  }
}

export async function initializeIndexes() {
  if (indexesInitialized) return;

  const usersCollection = await dbConnect(collections.USERS);
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const doctorsCollection = await dbConnect(collections.DOCTORS);
  const doctorAvailabilitiesCollection = await dbConnect(
    collections.DOCTOR_AVAILABILITIES,
  );

  await createIndexSafe(
    usersCollection.createIndex({ email: 1 }, { unique: true }),
    "users.email",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ doctor: 1 }),
    "appointments.doctor",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ patient: 1 }),
    "appointments.patient",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ appointmentDate: 1 }),
    "appointments.appointmentDate",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex(
      { "videoSession.callId": 1 },
      { sparse: true },
    ),
    "appointments.videoSession.callId",
  );

  await createIndexSafe(
    doctorsCollection.createIndex({ specialization: 1 }),
    "doctors.specialization",
  );
  await createIndexSafe(
    doctorsCollection.createIndex({ approvalStatus: 1, status: 1 }),
    "doctors.approvalStatus_status",
  );
  await createIndexSafe(
    doctorsCollection.createIndex({ specialization: 1, rating: -1 }),
    "doctors.specialization_rating",
  );
  await createIndexSafe(
    doctorAvailabilitiesCollection.createIndex(
      { doctorId: 1, dayOfWeek: 1, isActive: 1 },
      { name: "doctor_day_active" },
    ),
    "doctorAvailabilities.doctorId_dayOfWeek_isActive",
  );

  indexesInitialized = true;
}
