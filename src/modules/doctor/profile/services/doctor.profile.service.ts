import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import {
  DoctorProfilePatchInput,
  DoctorProfileResponse,
} from "./doctor.validation";

type SessionUser = {
  id?: string | null;
  doctorId?: string | null;
  email?: string | null;
  role?: string | null;
};

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

function toDoctorProfile(doctor: any): DoctorProfileResponse {
  return {
    fullName: doctor?.fullName ?? null,
    email: doctor?.email ?? "",
    phone: doctor?.phone ?? null,
    gender: doctor?.gender ?? null,
    age: doctor?.age ?? null,
    address: normalizeAddress(doctor?.address),
    profileImage: doctor?.profileImage ?? null,
    profileCompleted: Boolean(doctor?.profileCompleted),
    specialization: doctor?.specialization ?? null,
    licenseNumber: doctor?.licenseNumber ?? null,
    experienceYears: doctor?.experienceYears ?? null,
    consultationFee:
      typeof doctor?.consultationFee === "number"
        ? doctor.consultationFee
        : null,
    isVerified: Boolean(doctor?.isVerified),
    status: String(doctor?.status || "pending"),
    approvalStatus: String(doctor?.approvalStatus || "pending"),
    updatedAt:
      doctor?.updatedAt instanceof Date
        ? doctor.updatedAt.toISOString()
        : (doctor?.updatedAt ?? null),
  };
}

function canMarkProfileComplete(profile: DoctorProfileResponse) {
  return Boolean(
    profile.fullName &&
    profile.phone &&
    profile.gender &&
    profile.age &&
    profile.address.street &&
    profile.address.city &&
    profile.specialization &&
    typeof profile.consultationFee === "number",
  );
}

function resolveDoctorObjectIds(sessionUser: SessionUser) {
  const values = [sessionUser?.doctorId, sessionUser?.id]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value));

  return values
    .filter((value) => ObjectId.isValid(value))
    .map((value) => new ObjectId(value));
}

async function getDoctorDocOrThrow(sessionUser: SessionUser) {
  if (sessionUser?.role !== "doctor") {
    throw createHttpError(403, "Only doctors can access this profile endpoint");
  }

  const doctorsCollection = await dbConnect(collections.DOCTORS);
  const doctorObjectIds = resolveDoctorObjectIds(sessionUser);

  if (doctorObjectIds.length > 0) {
    const doctor = await doctorsCollection.findOne({
      _id: { $in: doctorObjectIds },
    });

    if (doctor) {
      return doctor;
    }
  }

  const email = String(sessionUser?.email || "")
    .trim()
    .toLowerCase();
  if (email) {
    const doctor = await doctorsCollection.findOne({ email });
    if (doctor) {
      return doctor;
    }
  }

  throw createHttpError(404, "Doctor profile not found");
}

async function syncDoctorSnapshotToUser(sessionUser: SessionUser, doctor: any) {
  const usersCollection = await dbConnect(collections.USERS);
  const now = new Date();

  const setPayload: Record<string, unknown> = {
    fullName: doctor?.fullName ?? null,
    phone: doctor?.phone ?? null,
    gender: doctor?.gender ?? null,
    age: doctor?.age ?? null,
    address: normalizeAddress(doctor?.address),
    profileImage: doctor?.profileImage ?? null,
    profileCompleted: Boolean(doctor?.profileCompleted),
    doctorId: doctor?._id ?? null,
    updatedAt: now,
  };

  if (sessionUser?.id && ObjectId.isValid(String(sessionUser.id))) {
    await usersCollection.updateOne(
      { _id: new ObjectId(String(sessionUser.id)) },
      { $set: setPayload },
    );
    return;
  }

  const email = String(sessionUser?.email || "")
    .trim()
    .toLowerCase();
  if (email) {
    await usersCollection.updateOne({ email }, { $set: setPayload });
  }
}

export async function getDoctorProfile(sessionUser: SessionUser) {
  const doctor = await getDoctorDocOrThrow(sessionUser);
  return toDoctorProfile(doctor);
}

export async function updateDoctorProfile(
  sessionUser: SessionUser,
  data: DoctorProfilePatchInput,
) {
  const existingDoctor = await getDoctorDocOrThrow(sessionUser);
  const doctorId = existingDoctor?._id;

  if (!doctorId) {
    throw createHttpError(404, "Doctor profile not found");
  }

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

  if (Object.prototype.hasOwnProperty.call(data, "specialization")) {
    updatePayload.specialization = data.specialization ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "consultationFee")) {
    updatePayload.consultationFee = data.consultationFee ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(data, "experienceYears")) {
    updatePayload.experienceYears = data.experienceYears ?? null;
  }

  if (data.address) {
    const currentAddress = normalizeAddress(existingDoctor.address);

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

  const mergedProfile = toDoctorProfile({
    ...existingDoctor,
    ...updatePayload,
    address: (updatePayload.address as any) ?? existingDoctor.address,
  });

  updatePayload.profileCompleted = canMarkProfileComplete(mergedProfile);

  const doctorsCollection = await dbConnect(collections.DOCTORS);

  await doctorsCollection.updateOne(
    { _id: doctorId },
    {
      $set: updatePayload,
    },
  );

  const updatedDoctor = await doctorsCollection.findOne({ _id: doctorId });

  if (!updatedDoctor) {
    throw createHttpError(404, "Doctor profile not found after update");
  }

  await syncDoctorSnapshotToUser(sessionUser, updatedDoctor);

  return toDoctorProfile(updatedDoctor);
}
