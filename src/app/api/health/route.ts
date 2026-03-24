import dns from "node:dns/promises";
import { NextResponse } from "next/server";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

export const dynamic = "force-dynamic";

type CheckStatus = "up" | "down";

type HealthCheckResult = {
  status: CheckStatus;
  latencyMs?: number;
  checkedAt: string;
  detail?: string;
};

type HealthResponse = {
  status: "healthy" | "unhealthy";
  statusMeaning: string;
  timestamp: string;
  uptimeSeconds: number;
  dbConnected: boolean;
  dnsResolved: boolean;
  app: {
    env: string;
    version: string;
  };
  process: {
    pid: number;
    platform: NodeJS.Platform;
    nodeVersion: string;
  };
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
  };
  checks: {
    dns: HealthCheckResult;
    db: HealthCheckResult;
  };
};

const CHECK_TIMEOUT_MS = 3000;

function getIsoNow() {
  return new Date().toISOString();
}

function parseMongoHost(uri: string | undefined): string | null {
  if (!uri) {
    return null;
  }

  const match = uri.match(/^mongodb(?:\+srv)?:\/\/(?:[^@]+@)?([^/?]+)/i);
  if (!match?.[1]) {
    return null;
  }

  const firstHost = match[1].split(",")[0]?.trim();
  if (!firstHost) {
    return null;
  }

  return firstHost.split(":")[0] || null;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}

async function runDnsCheck(host: string | null): Promise<HealthCheckResult> {
  const checkedAt = getIsoNow();

  if (!host) {
    return {
      status: "down",
      checkedAt,
      detail: "Mongo host is not configured",
    };
  }

  const started = Date.now();
  try {
    await withTimeout(dns.resolve(host), CHECK_TIMEOUT_MS);
    return {
      status: "up",
      checkedAt,
      latencyMs: Date.now() - started,
      detail: `Resolved ${host}`,
    };
  } catch (error) {
    return {
      status: "down",
      checkedAt,
      latencyMs: Date.now() - started,
      detail: error instanceof Error ? error.message : "DNS resolution failed",
    };
  }
}

async function runDbCheck(): Promise<HealthCheckResult> {
  const checkedAt = getIsoNow();
  const started = Date.now();

  try {
    const collection = await withTimeout(
      dbConnect(collections.USERS),
      CHECK_TIMEOUT_MS,
    );

    await withTimeout(
      collection.findOne({}, { projection: { _id: 1 } }),
      CHECK_TIMEOUT_MS,
    );

    return {
      status: "up",
      checkedAt,
      latencyMs: Date.now() - started,
      detail: "Database reachable",
    };
  } catch (error) {
    return {
      status: "down",
      checkedAt,
      latencyMs: Date.now() - started,
      detail: error instanceof Error ? error.message : "Database check failed",
    };
  }
}

export async function GET() {
  const timestamp = getIsoNow();
  const mongoHost = parseMongoHost(process.env.MONGO_URI);

  const [dnsCheck, dbCheck] = await Promise.all([
    runDnsCheck(mongoHost),
    runDbCheck(),
  ]);

  const memoryUsage = process.memoryUsage();
  const dbConnected = dbCheck.status === "up";
  const dnsResolved = dnsCheck.status === "up";
  const hasCriticalFailure = !dnsResolved || !dbConnected;

  const response: HealthResponse = {
    status: hasCriticalFailure ? "unhealthy" : "healthy",
    statusMeaning: hasCriticalFailure
      ? "At least one critical dependency is not healthy. Check dbConnected and dnsResolved."
      : "All critical dependencies are healthy.",
    timestamp,
    uptimeSeconds: Math.floor(process.uptime()),
    dbConnected,
    dnsResolved,
    app: {
      env: process.env.NODE_ENV || "unknown",
      version: process.env.npm_package_version || "unknown",
    },
    process: {
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
    },
    memory: {
      rss: memoryUsage.rss,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
    },
    checks: {
      dns: dnsCheck,
      db: dbCheck,
    },
  };

  return NextResponse.json(response, {
    status: hasCriticalFailure ? 503 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
