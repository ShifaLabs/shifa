import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

export interface RecommendedDoctor {
  id: string;
  fullName: string;
  specialization?: string;
  consultationFee?: number;
  experienceYears?: number;
  rating?: number;
  profileImage?: string;
}

function normalizeSpecialization(value: string) {
  return value.toLowerCase().trim();
}

export async function findDoctorsBySpecialization(specialization: string) {
  const doctorCollection = await dbConnect(collections.DOCTORS);
  const normalized = normalizeSpecialization(specialization);

  const doctors = await doctorCollection
    .find(
      {
        specialization: { $regex: `^${normalized}$`, $options: "i" },
        approvalStatus: "approved",
        status: "active",
      },
      {
        projection: {
          password: 0,
        },
      },
    )
    .sort({ rating: -1, experienceYears: -1, createdAt: -1 })
    .limit(5)
    .toArray();

  const safeDoctors: RecommendedDoctor[] = doctors.map((doctor: any) => ({
    id: doctor._id?.toString?.() || "",
    fullName: doctor.fullName,
    specialization: doctor.specialization,
    consultationFee: doctor.consultationFee,
    experienceYears: doctor.experienceYears,
    rating: doctor.rating,
    profileImage: doctor.profileImage,
  }));

  return safeDoctors;
}
