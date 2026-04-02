// === MUST BE THE VERY FIRST LINES ===
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1"]);

import { Db, MongoClient, ServerApiVersion } from "mongodb";

/**
 * Centralized collection names
 * Never hardcode collection strings elsewhere.
 */
export const collections = {
  USERS: "users",
  DOCTORS: "doctors",
  DOCTOR_AVAILABILITIES: "doctorAvailabilities",
  ADMIN_AUDIT_LOGS: "adminAuditLogs",
  ADMIN_SETTINGS: "adminSettings",
  APPOINTMENTS: "appointments",
  EMAIL_VERIFICATIONS: "emailVerifications",
  COUNTERS: "counters",
  BLOGS: "blogs",
  FOLLOW_UPS: "followUps",
  SUPPORT_TICKETS: "SupportTickets",
  AMBULANCE_PROVIDERS: "ambulanceProviders",
  AMBULANCE_VEHICLES: "ambulanceVehicles",
  AMBULANCE_AVAILABILITY: "ambulanceAvailability",
  AMBULANCE_BOOKINGS: "ambulanceBookings",
  AMBULANCE_LOCATION_EVENTS: "ambulanceLocationEvents",
  AMBULANCE_DISPATCH_EVENTS: "ambulanceDispatchEvents",
} as const;

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("❌ Please add MONGO_URI to environment variables");
}

if (!dbName) {
  throw new Error("❌ Please add DB_NAME to environment variables");
}

/**
 * Global cache for Mongo client promise
 * Prevents connection explosion in development (Next.js hot reload)
 */
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

/**
 * Reuse connection if it already exists
 */
const clientPromise = global._mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV === "development") {
  global._mongoClientPromise = clientPromise;
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function dbConnect(
  collectionName: (typeof collections)[keyof typeof collections],
) {
  const db = await getDb();
  return db.collection(collectionName);
}

export type DatabaseHandle = Db;
