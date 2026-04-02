import { collections, getDb } from "./dbConnect";

let indexesInitialized = false;
let indexesPromise: Promise<void> | null = null;

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

async function createIndexRequired(
  createIndexCall: Promise<string>,
  label: string,
) {
  try {
    await createIndexCall;
  } catch (error: any) {
    const message = error?.message || String(error);
    console.error(`Required index creation failed for ${label}:`, message);
    throw new Error(`Required index creation failed for ${label}: ${message}`);
  }
}

export async function initializeIndexes() {
  if (indexesInitialized) return;

  if (!indexesPromise) {
    indexesPromise = initializeIndexesInternal().then(() => {
      indexesInitialized = true;
    });
  }

  try {
    await indexesPromise;
  } catch (error) {
    indexesPromise = null;
    throw error;
  }
}

async function initializeIndexesInternal() {
  const db = await getDb();

  const usersCollection = db.collection(collections.USERS);
  const appointmentsCollection = db.collection(collections.APPOINTMENTS);
  const followUpsCollection = db.collection(collections.FOLLOW_UPS);
  const doctorsCollection = db.collection(collections.DOCTORS);
  const doctorAvailabilitiesCollection = db.collection(
    collections.DOCTOR_AVAILABILITIES,
  );
  const adminAuditLogsCollection = db.collection(
    collections.ADMIN_AUDIT_LOGS,
  );
  const ambulanceProvidersCollection = db.collection(
    collections.AMBULANCE_PROVIDERS,
  );
  const ambulanceVehiclesCollection = db.collection(
    collections.AMBULANCE_VEHICLES,
  );
  const ambulanceAvailabilityCollection = db.collection(
    collections.AMBULANCE_AVAILABILITY,
  );
  const ambulanceBookingsCollection = db.collection(
    collections.AMBULANCE_BOOKINGS,
  );
  const ambulanceLocationEventsCollection = db.collection(
    collections.AMBULANCE_LOCATION_EVENTS,
  );
  const ambulanceDispatchEventsCollection = db.collection(
    collections.AMBULANCE_DISPATCH_EVENTS,
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
    appointmentsCollection.createIndex({ doctorId: 1 }, { sparse: true }),
    "appointments.doctorId",
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
    appointmentsCollection.createIndex({ paymentStatus: 1 }),
    "appointments.paymentStatus",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ "payment.completedAt": -1 }),
    "appointments.payment.completedAt",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex(
      { "payment.transactionId": 1 },
      { unique: true, sparse: true },
    ),
    "appointments.payment.transactionId",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ createdAt: -1 }),
    "appointments.createdAt",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ status: 1, updatedAt: -1 }),
    "appointments.status_updatedAt",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({ status: 1, appointmentDate: -1 }),
    "appointments.status_appointmentDate",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex(
      { doctorId: 1, status: 1, appointmentDate: -1 },
      { sparse: true },
    ),
    "appointments.doctorId_status_appointmentDate",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({
      doctor: 1,
      dateKey: 1,
      timeSlot: 1,
      status: 1,
    }),
    "appointments.doctor_dateKey_timeSlot_status",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({
      doctor: 1,
      status: 1,
      appointmentDate: -1,
    }),
    "appointments.doctor_status_appointmentDate",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({
      patient: 1,
      status: 1,
      appointmentDate: -1,
    }),
    "appointments.patient_status_appointmentDate",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({
      "adminFlags.escalated": 1,
      appointmentDate: -1,
    }),
    "appointments.adminFlags.escalated_appointmentDate",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({
      "adminFlags.refundRequired": 1,
      updatedAt: -1,
    }),
    "appointments.adminFlags.refundRequired_updatedAt",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex({
      doctor: 1,
      "payment.completedAt": -1,
    }),
    "appointments.doctor_payment.completedAt",
  );
  await createIndexSafe(
    appointmentsCollection.createIndex(
      { "videoSession.callId": 1 },
      { sparse: true },
    ),
    "appointments.videoSession.callId",
  );
  await createIndexSafe(
    followUpsCollection.createIndex({ appointmentId: 1, createdAt: -1 }),
    "followUps.appointmentId_createdAt",
  );
  await createIndexSafe(
    followUpsCollection.createIndex({ doctorId: 1, createdAt: -1 }),
    "followUps.doctorId_createdAt",
  );
  await createIndexSafe(
    followUpsCollection.createIndex({ patientId: 1, createdAt: -1 }),
    "followUps.patientId_createdAt",
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
    doctorsCollection.createIndex({ status: 1, createdAt: -1 }),
    "doctors.status_createdAt",
  );
  await createIndexSafe(
    doctorsCollection.createIndex({ fullName: 1, createdAt: -1 }),
    "doctors.fullName_createdAt",
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
  await createIndexSafe(
    adminAuditLogsCollection.createIndex({
      entityType: 1,
      entityId: 1,
      createdAt: -1,
    }),
    "adminAuditLogs.entityType_entityId_createdAt",
  );
  await createIndexSafe(
    adminAuditLogsCollection.createIndex({ actorId: 1, createdAt: -1 }),
    "adminAuditLogs.actorId_createdAt",
  );
  await createIndexSafe(
    ambulanceProvidersCollection.createIndex({ userId: 1 }, { unique: true }),
    "ambulanceProviders.userId",
  );
  await createIndexSafe(
    ambulanceProvidersCollection.createIndex({ baseLocation: "2dsphere" }),
    "ambulanceProviders.baseLocation",
  );
  await createIndexSafe(
    ambulanceProvidersCollection.createIndex({
      approvalStatus: 1,
      "moderation.state": 1,
      updatedAt: -1,
    }),
    "ambulanceProviders.approvalStatus_moderation_updatedAt",
  );
  await createIndexSafe(
    ambulanceVehiclesCollection.createIndex(
      { providerId: 1, vehicleNumber: 1 },
      { unique: true },
    ),
    "ambulanceVehicles.providerId_vehicleNumber",
  );
  await createIndexSafe(
    ambulanceVehiclesCollection.createIndex({
      providerId: 1,
      status: 1,
      updatedAt: -1,
    }),
    "ambulanceVehicles.providerId_status_updatedAt",
  );
  await createIndexSafe(
    ambulanceAvailabilityCollection.createIndex(
      { providerId: 1 },
      { unique: true },
    ),
    "ambulanceAvailability.providerId",
  );
  await createIndexSafe(
    ambulanceAvailabilityCollection.createIndex(
      { vehicleId: 1 },
      { sparse: true },
    ),
    "ambulanceAvailability.vehicleId",
  );
  await createIndexRequired(
    ambulanceAvailabilityCollection.createIndex({ currentLocation: "2dsphere" }),
    "ambulanceAvailability.currentLocation",
  );
  await createIndexSafe(
    ambulanceAvailabilityCollection.createIndex({
      isOnline: 1,
      dispatchStatus: 1,
      lastLocationAt: -1,
    }),
    "ambulanceAvailability.isOnline_dispatchStatus_lastLocationAt",
  );
  await createIndexSafe(
    ambulanceBookingsCollection.createIndex(
      { bookingCode: 1 },
      { unique: true },
    ),
    "ambulanceBookings.bookingCode",
  );
  await createIndexSafe(
    ambulanceBookingsCollection.createIndex({
      patientId: 1,
      createdAt: -1,
    }),
    "ambulanceBookings.patientId_createdAt",
  );
  await createIndexSafe(
    ambulanceBookingsCollection.createIndex({
      assignedProviderId: 1,
      status: 1,
      updatedAt: -1,
    }),
    "ambulanceBookings.assignedProviderId_status_updatedAt",
  );
  await createIndexSafe(
    ambulanceBookingsCollection.createIndex({
      status: 1,
      "dispatch.offerExpiresAt": 1,
      updatedAt: -1,
    }),
    "ambulanceBookings.status_offerExpiresAt_updatedAt",
  );
  await createIndexSafe(
    ambulanceLocationEventsCollection.createIndex({
      providerId: 1,
      capturedAt: -1,
    }),
    "ambulanceLocationEvents.providerId_capturedAt",
  );
  await createIndexSafe(
    ambulanceLocationEventsCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    ),
    "ambulanceLocationEvents.expiresAt_ttl",
  );
  await createIndexSafe(
    ambulanceDispatchEventsCollection.createIndex({
      bookingId: 1,
      createdAt: -1,
    }),
    "ambulanceDispatchEvents.bookingId_createdAt",
  );
}
