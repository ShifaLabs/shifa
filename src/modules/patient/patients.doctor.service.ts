import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";

export async function getActivePatientsForDoctor(doctorId: string) {
  if (!doctorId || !ObjectId.isValid(doctorId)) {
    throw new Error("Valid doctor ID is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const patients = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: new ObjectId(doctorId),
          appointmentDate: { $gte: new Date() },
          status: { $in: ["Approved", "Confirmed"] },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },

      {
        $unwind: "$patient",
      },

      {
        $group: {
          _id: "$patient._id",

          fullName: { $first: "$patient.fullName" },
          email: { $first: "$patient.email" },
          profileImage: { $first: "$patient.profileImage" },

          nextAppointment: { $min: "$appointmentDate" },

          totalUpcoming: { $sum: 1 },
        },
      },

      {
        $sort: { nextAppointment: 1 },
      },
    ])
    .toArray();

  return patients;
}

export async function getPastPatientsForDoctor(doctorId: string) {
  if (!doctorId || !ObjectId.isValid(doctorId)) {
    throw new Error("Valid doctor ID is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const patients = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: new ObjectId(doctorId),
          appointmentDate: { $lt: new Date() },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patient",
        },
      },

      {
        $unwind: "$patient",
      },

      {
        $group: {
          _id: "$patient._id",

          fullName: { $first: "$patient.fullName" },
          email: { $first: "$patient.email" },
          profileImage: { $first: "$patient.profileImage" },

          lastVisit: { $max: "$appointmentDate" },

          totalVisits: { $sum: 1 },
        },
      },

      {
        $sort: { lastVisit: -1 },
      },
    ])
    .toArray();

  return patients;
}
