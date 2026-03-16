import { ObjectId } from "mongodb";
import { findUserById, updateUserProfile } from "./user.repository";
import {
  PatientProfilePatchInput,
  PatientProfileResponse,
} from "./user.validation";

const PATIENT_ROLE = "patient";

function createHttpError(status: number, message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

function normalizeAddress(address: any) {
  return {
    street: address?.street ?? null,
    city: address?.city ?? null,
    country: address?.country ?? null,
    zipCode: address?.zipCode ?? null,
  };
}

function toPatientProfile(user: any): PatientProfileResponse {
  return {
    fullName: user?.fullName ?? null,
    email: user?.email ?? "",
    phone: user?.phone ?? null,
    gender: user?.gender ?? null,
    age: user?.age ?? null,
    address: normalizeAddress(user?.address),
    profileImage: user?.profileImage ?? null,
    profileCompleted: Boolean(user?.profileCompleted),
  };
}

function canMarkProfileComplete(profile: PatientProfileResponse) {
  return Boolean(
    profile.fullName &&
    profile.phone &&
    profile.gender &&
    profile.age &&
    profile.address.street &&
    profile.address.city,
  );
}

async function getPatientOrThrow(userId: string) {
  if (!ObjectId.isValid(userId)) {
    throw createHttpError(400, "Invalid user id in session");
  }

  const user = await findUserById(userId);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  if (user.role !== PATIENT_ROLE) {
    throw createHttpError(
      403,
      "Only patients can access this profile endpoint",
    );
  }

  return user;
}

export async function getPatientProfile(userId: string) {
  const user = await getPatientOrThrow(userId);
  return toPatientProfile(user);
}

export async function updatePatientProfile(
  userId: string,
  data: PatientProfilePatchInput,
) {
  const existingUser = await getPatientOrThrow(userId);

  const updatePayload: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (Object.prototype.hasOwnProperty.call(data, "fullName")) {
    updatePayload.fullName = data.fullName ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "phone")) {
    updatePayload.phone = data.phone ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "gender")) {
    updatePayload.gender = data.gender ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "age")) {
    updatePayload.age = data.age ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "profileImage")) {
    updatePayload.profileImage = data.profileImage ?? null;
  }

  if (data.address) {
    const currentAddress = normalizeAddress(existingUser.address);

    updatePayload.address = {
      street: Object.prototype.hasOwnProperty.call(data.address, "street")
        ? (data.address.street ?? null)
        : currentAddress.street,
      city: Object.prototype.hasOwnProperty.call(data.address, "city")
        ? (data.address.city ?? null)
        : currentAddress.city,
      country: Object.prototype.hasOwnProperty.call(data.address, "country")
        ? (data.address.country ?? null)
        : currentAddress.country,
      zipCode: Object.prototype.hasOwnProperty.call(data.address, "zipCode")
        ? (data.address.zipCode ?? null)
        : currentAddress.zipCode,
    };
  }

  const mergedProfile = toPatientProfile({
    ...existingUser,
    ...updatePayload,
    address: (updatePayload.address as any) ?? existingUser.address,
  });

  updatePayload.profileCompleted = canMarkProfileComplete(mergedProfile);

  const updatedUser = await updateUserProfile(
    userId,
    updatePayload,
    existingUser.updatedAt ?? null,
  );

  if (!updatedUser) {
    throw createHttpError(
      409,
      "Profile was updated by another request. Please refresh and try again.",
    );
  }

  return toPatientProfile(updatedUser);
}
