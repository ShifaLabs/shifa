import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { MongoClient, ServerApiVersion } from "mongodb";

dns.setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1"]);

function loadEnvFile(filename) {
  const envPath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function isValidCoordinatePair(value) {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }

  const [lng, lat] = value;
  return (
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180 &&
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90
  );
}

function isValidGeoPoint(value) {
  if (value === null) return true;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return value.type === "Point" && isValidCoordinatePair(value.coordinates);
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) {
    throw new Error("Missing MONGO_URI. Set it in the environment or .env.local.");
  }

  if (!dbName) {
    throw new Error("Missing DB_NAME. Set it in the environment or .env.local.");
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  try {
    const db = client.db(dbName);
    const availability = db.collection("ambulanceAvailability");

    const cursor = availability.find(
      {},
      { projection: { currentLocation: 1, providerId: 1 } },
    );

    const invalidIds = [];
    for await (const doc of cursor) {
      if (!isValidGeoPoint(doc.currentLocation)) {
        invalidIds.push(doc._id);
      }
    }

    if (invalidIds.length) {
      const updateResult = await availability.updateMany(
        { _id: { $in: invalidIds } },
        { $set: { currentLocation: null, updatedAt: new Date() } },
      );

      console.info(
        `[repair-ambulance-geo-index] Reset invalid currentLocation to null for ${updateResult.modifiedCount} documents.`,
      );
      console.info(
        "[repair-ambulance-geo-index] Affected document ids:",
        invalidIds.map((id) => id.toString()).join(", "),
      );
    } else {
      console.info(
        "[repair-ambulance-geo-index] No malformed ambulance availability locations found.",
      );
    }

    const indexName = await availability.createIndex({
      currentLocation: "2dsphere",
    });

    console.info(
      `[repair-ambulance-geo-index] Verified geospatial index: ${indexName}`,
    );
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("[repair-ambulance-geo-index] Failed:", error);
  process.exitCode = 1;
});
