type NearbyHospitalsParams = {
  lat: number;
  lng: number;
  radius?: number;
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

export type HospitalDTO = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tags: Record<string, string>;
};

export type NearbyHospitalsResult = {
  hospitals: HospitalDTO[];
  meta: {
    source: "overpass";
    cacheHit: boolean;
    stale: boolean;
    fetchedAt: string;
    radius: number;
    count: number;
  };
};

type CacheEntry = {
  data: HospitalDTO[];
  fetchedAt: number;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

const DEFAULT_RADIUS_M = parseNumberEnv(
  process.env.HOSPITALS_DEFAULT_RADIUS_M,
  5000,
);
const MAX_RADIUS_M = parseNumberEnv(process.env.HOSPITALS_MAX_RADIUS_M, 20000);
const CACHE_TTL_MS =
  parseNumberEnv(process.env.HOSPITALS_CACHE_TTL_S, 600) * 1000;
const OVERPASS_TIMEOUT_MS = parseNumberEnv(
  process.env.HOSPITALS_REQUEST_TIMEOUT_MS,
  5000,
);
const OVERPASS_URL =
  process.env.OVERPASS_URL?.trim() || "https://overpass-api.de/api/interpreter";

function parseNumberEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clampRadius(radius: number | undefined) {
  if (!Number.isFinite(radius as number)) {
    return DEFAULT_RADIUS_M;
  }
  return Math.min(Math.max(Number(radius), 500), MAX_RADIUS_M);
}

function getCacheKey(lat: number, lng: number, radius: number) {
  // ~110m cell with 3 decimal precision, balances cache reuse and relevance.
  const latBucket = lat.toFixed(3);
  const lngBucket = lng.toFixed(3);
  return `hospitals:${latBucket}:${lngBucket}:${radius}`;
}

function buildOverpassQuery(lat: number, lng: number, radius: number) {
  return `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${radius},${lat},${lng});
  way["amenity"="hospital"](around:${radius},${lat},${lng});
  relation["amenity"="hospital"](around:${radius},${lat},${lng});
);
out center tags;
`;
}

function normalizeHospital(el: OverpassElement): HospitalDTO | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  // Keep response focused and safe for Bangladesh-only map rendering.
  if (lat < 20 || lat > 27 || lng < 88 || lng > 93) {
    return null;
  }

  const name = (el.tags?.name || "").trim() || "Unnamed Hospital";

  return {
    id: `${el.type}-${el.id}`,
    name,
    lat: Number(lat),
    lng: Number(lng),
    tags: el.tags || {},
  };
}

function dedupeHospitals(hospitals: HospitalDTO[]) {
  const seen = new Set<string>();
  const output: HospitalDTO[] = [];

  for (const item of hospitals) {
    const key = `${item.name.toLowerCase()}:${item.lat.toFixed(5)}:${item.lng.toFixed(5)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(item);
  }

  return output;
}

function getAbortSignal(timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, timeoutId };
}

async function fetchOverpassOnce(query: string): Promise<OverpassResponse> {
  const { signal, timeoutId } = getAbortSignal(OVERPASS_TIMEOUT_MS);

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: query,
      signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Overpass request failed: ${res.status}`);
    }

    return (await res.json()) as OverpassResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchOverpassWithRetry(query: string) {
  try {
    return await fetchOverpassOnce(query);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return await fetchOverpassOnce(query);
  }
}

export async function getNearbyHospitals({
  lat,
  lng,
  radius,
}: NearbyHospitalsParams): Promise<NearbyHospitalsResult> {
  const effectiveRadius = clampRadius(radius);
  const key = getCacheKey(lat, lng, effectiveRadius);
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && cached.expiresAt > now) {
    return {
      hospitals: cached.data,
      meta: {
        source: "overpass",
        cacheHit: true,
        stale: false,
        fetchedAt: new Date(cached.fetchedAt).toISOString(),
        radius: effectiveRadius,
        count: cached.data.length,
      },
    };
  }

  const overpassQuery = buildOverpassQuery(lat, lng, effectiveRadius);

  try {
    const payload = await fetchOverpassWithRetry(overpassQuery);
    const normalized = (payload.elements || [])
      .map(normalizeHospital)
      .filter((item): item is HospitalDTO => Boolean(item));

    const deduped = dedupeHospitals(normalized);

    cache.set(key, {
      data: deduped,
      fetchedAt: now,
      expiresAt: now + CACHE_TTL_MS,
    });

    return {
      hospitals: deduped,
      meta: {
        source: "overpass",
        cacheHit: false,
        stale: false,
        fetchedAt: new Date(now).toISOString(),
        radius: effectiveRadius,
        count: deduped.length,
      },
    };
  } catch (error) {
    if (cached) {
      return {
        hospitals: cached.data,
        meta: {
          source: "overpass",
          cacheHit: true,
          stale: true,
          fetchedAt: new Date(cached.fetchedAt).toISOString(),
          radius: effectiveRadius,
          count: cached.data.length,
        },
      };
    }

    const upstreamError = new Error(
      "Hospital lookup service is currently unavailable.",
    );
    (upstreamError as Error & { status?: number }).status = 503;
    throw upstreamError;
  } finally {
    // Lightweight periodic cleanup.
    if (Math.random() < 0.01) {
      for (const [cacheKey, value] of cache.entries()) {
        if (value.expiresAt <= Date.now()) {
          cache.delete(cacheKey);
        }
      }
    }
  }
}

export const nearbyHospitalsConfig = {
  DEFAULT_RADIUS_M,
  MAX_RADIUS_M,
};
