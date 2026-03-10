import "server-only";

import { collections, dbConnect } from "@/lib/dbConnect";

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function getPaymentTransactionDetails(transactionId: string) {
  if (!transactionId) {
    throw new Error("Transaction id is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const result = await appointmentsCollection
    .aggregate([
      {
        $match: {
          "payment.transactionId": transactionId,
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
        $unwind: {
          path: "$doctorInfo",
          preserveNullAndEmptyArrays: true,
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
          doctor: {
            name: "$doctorInfo.fullName",
            specialization: "$doctorInfo.specialization",
          },
          patient: {
            fullName: "$patientInfo.fullName",
            email: "$patientInfo.email",
            phone: "$patientInfo.phone",
          },
        },
      },
    ])
    .toArray();

  return serialize(result[0] || null);
}

export async function confirmPaymentByTransactionId(transactionId: string) {
  if (!transactionId) {
    throw new Error("Transaction id is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const updatePayload: any = {
    $set: {
      paymentStatus: "paid",
      status: "Approved",
      "payment.status": "completed",
      "payment.completedAt": new Date(),
      updatedAt: new Date(),
    },
    $push: {
      auditTrail: {
        action: "Payment confirmed",
        performedBy: "Patient",
        from: "PendingPayment",
        to: "Approved",
        at: new Date(),
      },
    },
  };

  await appointmentsCollection.findOneAndUpdate(
    {
      "payment.transactionId": transactionId,
      paymentStatus: { $ne: "paid" },
    },
    updatePayload,
    { returnDocument: "after" },
  );

  const details = await getPaymentTransactionDetails(transactionId);
  return serialize(details || null);
}
