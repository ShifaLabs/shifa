import "server-only";

import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const HIDE_EXPIRED_AFTER_MINUTES = 15;

export async function getDoctorAppointmentsForDashboard(doctorId: string) {
  if (!doctorId || !ObjectId.isValid(doctorId)) {
    throw new Error("Valid doctor ID is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const expiredCutoff = new Date(
    Date.now() - HIDE_EXPIRED_AFTER_MINUTES * 60 * 1000,
  );

  const result = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: new ObjectId(doctorId),
          $or: [
            { status: { $ne: "Expired" } },
            {
              status: "Expired",
              updatedAt: { $gte: expiredCutoff },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      {
        $unwind: {
          path: "$patientInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          appointmentId: 1,
          appointmentDate: 1,
          status: 1,
          paymentStatus: 1,
          consultationType: 1,
          symptoms: 1,
          payment: 1,
          videoSession: 1,
          meetingLink: "$videoSession.meetingLink",
          createdAt: 1,
          updatedAt: 1,
          patientInfo: {
            _id: "$patientInfo._id",
            fullName: "$patientInfo.fullName",
            email: "$patientInfo.email",
            phone: "$patientInfo.phone",
            profileImage: "$patientInfo.profileImage",
          },
        },
      },
      {
        $sort: { appointmentDate: -1 },
      },
    ])
    .toArray();

  return serialize(result);
}

export async function getDoctorAppointmentDetails(
  doctorId: string,
  appointmentId: string,
) {
  if (!doctorId || !ObjectId.isValid(doctorId)) {
    throw new Error("Valid doctor ID is required");
  }

  if (!appointmentId || !ObjectId.isValid(appointmentId)) {
    throw new Error("Valid appointment ID is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const result = await appointmentsCollection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(appointmentId),
          doctor: new ObjectId(doctorId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "patient",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      {
        $unwind: {
          path: "$patientInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          appointmentId: 1,
          appointmentDate: 1,
          status: 1,
          paymentStatus: 1,
          consultationType: 1,
          symptoms: 1,
          payment: 1,
          videoSession: 1,
          auditTrail: 1,
          createdAt: 1,
          updatedAt: 1,
          patientInfo: {
            _id: "$patientInfo._id",
            fullName: "$patientInfo.fullName",
            email: "$patientInfo.email",
            phone: "$patientInfo.phone",
            profileImage: "$patientInfo.profileImage",
            gender: "$patientInfo.gender",
            age: "$patientInfo.age",
            address: "$patientInfo.address",
          },
        },
      },
    ])
    .toArray();

  return serialize(result[0] || null);
}
