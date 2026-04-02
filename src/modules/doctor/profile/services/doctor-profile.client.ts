import {
  ApiEnvelope,
  DoctorProfileApiData,
} from "../types/doctor-profile.types";

async function parseApiEnvelope<T>(
  response: Response,
): Promise<ApiEnvelope<T> | null> {
  const raw = await response.text();

  if (!raw || !raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}

export async function fetchDoctorProfileApi() {
  const response = await fetch("/api/doctor/profile", {
    method: "GET",
    cache: "no-store",
  });

  const envelope = await parseApiEnvelope<DoctorProfileApiData>(response);

  if (!response.ok || !envelope?.data) {
    throw new Error(envelope?.error || "Failed to load profile");
  }

  return envelope.data;
}

export async function updateDoctorProfileApi(payload: unknown) {
  const response = await fetch("/api/doctor/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const envelope = await parseApiEnvelope<DoctorProfileApiData>(response);

  if (!response.ok || !envelope?.data) {
    const firstValidation = envelope?.validationErrors?.[0]?.message;
    throw new Error(
      firstValidation || envelope?.error || "Failed to update profile",
    );
  }

  return envelope.data;
}
