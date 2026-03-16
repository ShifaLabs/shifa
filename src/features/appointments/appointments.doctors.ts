import { collections, dbConnect } from "@/lib/dbConnect";
import { Doctor } from "@/Types/types";

interface GetDoctorsOptions {
  page?: number;
  limit?: number;
  specialization?: string;
  isVerified?: boolean;
}

export async function getDoctors(options: GetDoctorsOptions = {}) {
  const { page = 1, limit = 10, specialization, isVerified } = options;
  const doctorsCollection = await dbConnect(collections.DOCTORS);

  // Build dynamic query
  const query: any = {};
  if (specialization) query.specialization = specialization;
  if (typeof isVerified === "boolean") query.isVerified = isVerified;

  const skip = (page - 1) * limit;

  const doctors = await doctorsCollection
    .find(query, {
      projection: {
        password: 0, // never expose sensitive data
        internalNotes: 0,
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const total = await doctorsCollection.countDocuments(query);

  // Serialize MongoDB ObjectId and Dates
  const serializedDoctors: Doctor[] = doctors.map((doc) => ({
    _id: doc._id.toString(),
    fullName: doc.fullName,
    email: doc.email,
    role: doc.role,
    phone: doc.phone,
    gender: doc.gender,
    age: doc.age,
    address: doc.address,
    profileImage:
      typeof doc.profileImage === "string" && doc.profileImage.trim()
        ? doc.profileImage.trim()
        : undefined,
    specialization: doc.specialization,
    licenseNumber: doc.licenseNumber,
    experienceYears: doc.experienceYears,
    status: doc.status,
    isVerified: doc.isVerified,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt,
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : doc.updatedAt,
  }));

  return {
    data: serializedDoctors,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

import { ObjectId } from "mongodb";

export async function getDoctorById(doctorId: string): Promise<Doctor> {
  if (!doctorId) {
    throw new Error("Doctor ID is required");
  }

  if (!ObjectId.isValid(doctorId)) {
    throw new Error("Invalid Doctor ID format");
  }

  const doctorsCollection = await dbConnect(collections.DOCTORS);

  const doctor = await doctorsCollection.findOne(
    { _id: new ObjectId(doctorId) },
    {
      projection: {
        fullName: 1,
        email: 1,
        role: 1,
        phone: 1,
        gender: 1,
        age: 1,
        address: 1,
        profileImage: 1,
        specialization: 1,
        licenseNumber: 1,
        experienceYears: 1,
        status: 1,
        isVerified: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  );

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Controlled DTO mapping
  const mappedDoctor: Doctor = {
    _id: doctor._id.toString(),
    fullName: doctor.fullName,
    email: doctor.email,
    role: doctor.role,
    phone: doctor.phone,
    gender: doctor.gender,
    age: doctor.age,
    address: {
      street: doctor.address?.street ?? "",
      city: doctor.address?.city ?? "",
      country: doctor.address?.country ?? "",
      zipCode: doctor.address?.zipCode ?? "",
    },
    profileImage:
      typeof doctor.profileImage === "string" && doctor.profileImage.trim()
        ? doctor.profileImage.trim()
        : undefined,
    specialization: doctor.specialization ?? undefined,
    licenseNumber: doctor.licenseNumber ?? undefined,
    experienceYears: doctor.experienceYears ?? undefined,
    status: doctor.status,
    isVerified: doctor.isVerified ?? false,
    createdAt: doctor.createdAt?.toISOString?.() ?? "",
    updatedAt: doctor.updatedAt?.toISOString?.() ?? "",
  };

  return mappedDoctor;
}
