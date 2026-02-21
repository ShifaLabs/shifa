"use server";
import { collections, dbConnect } from "@/lib/dbConnect";

interface Address {
  street: string;
  city: string;
  country: string;
  zipCode: string;
}

export interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string;
  gender: string;
  age: number;
  address: Address;
  profileImage?: string;
  specialization?: string;
  licenseNumber?: string;
  experienceYears?: number;
  status: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

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
    profileImage: doc.profileImage,
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
