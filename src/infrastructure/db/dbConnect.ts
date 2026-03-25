// === MUST BE THE VERY FIRST LINES ===
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1"]);

import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * Centralized collection names
 * Never hardcode collection strings elsewhere.
 */
export const collections = {
  USERS: "users",
  DOCTORS: "doctors",
  DOCTOR_AVAILABILITIES: "doctorAvailabilities",
  ADMIN_AUDIT_LOGS: "adminAuditLogs",
  APPOINTMENTS: "appointments",
  EMAIL_VERIFICATIONS: "emailVerifications",
  COUNTERS: "counters",
  BLOGS: "blogs",
  SUPPORT_TICKETS: "SupportTickets",
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

export async function dbConnect(
  collectionName: (typeof collections)[keyof typeof collections],
) {
  const client = await clientPromise;
  const db = client.db(dbName);
  return db.collection(collectionName);
}
