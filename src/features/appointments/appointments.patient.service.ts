import "server-only";

import { ObjectId } from "mongodb";
import { collections, dbConnect } from "@/lib/dbConnect";

const AUTO_EXPIRE_MINUTES = 15;
const CANCELLED_VISIBILITY_MINUTES = 10;
const VISIBLE_CONFIRMED_STATUSES = ["Confirmed", "confirmed", "Approved"];

function getThresholdDate(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function expirePendingAppointmentsForPatient(patientId: string) {
  if (!ObjectId.isValid(patientId)) {
    throw new Error("Invalid patient id");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const now = new Date();
  const expireBefore = getThresholdDate(AUTO_EXPIRE_MINUTES);
  const expireUpdatePayload: any = {
    $set: {
      status: "Expired",
      updatedAt: now,
    },
    $push: {
      auditTrail: {
        action: "Auto Expired",
        performedBy: "System",
        from: "PendingPayment",
        to: "Expired",
        at: now,
      },
    },
  };

  await appointmentsCollection.updateMany(
    {
      patient: new ObjectId(patientId),
      status: "PendingPayment",
      paymentStatus: "unpaid",
      createdAt: { $lte: expireBefore },
    },
    expireUpdatePayload,
  );
}

export async function getPatientAppointmentsForDashboard(patientId: string) {
  if (!ObjectId.isValid(patientId)) {
    throw new Error("Invalid patient id");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const hideCancelledBefore = getThresholdDate(CANCELLED_VISIBILITY_MINUTES);

  const appointments = await appointmentsCollection
    .aggregate([
      {
        $match: {
          patient: new ObjectId(patientId),
          $or: [
            { status: { $in: VISIBLE_CONFIRMED_STATUSES } },
            { status: "Cancelled", updatedAt: { $gt: hideCancelledBefore } },
          ],
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
      {
        $project: {
          _id: 1,
          appointmentId: 1,
          appointmentDate: 1,
          status: 1,
          paymentStatus: 1,
          payment: 1,
          consultationType: 1,
          symptoms: 1,
          meetingLink: 1,
          videoSession: 1,
          doctorName: "$doctorInfo.fullName",
          specialization: "$doctorInfo.specialization",
        },
      },
      {
        $sort: { appointmentDate: -1 },
      },
    ])
    .toArray();

  return serialize(appointments);
}

export async function getPatientAppointmentDetails(
  patientId: string,
  appointmentId: string,
) {
  if (!ObjectId.isValid(patientId) || !ObjectId.isValid(appointmentId)) {
    throw new Error("Invalid appointment or patient id");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const result = await appointmentsCollection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(appointmentId),
          patient: new ObjectId(patientId),
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
    ])
    .toArray();

  return serialize(result[0] || null);
}
