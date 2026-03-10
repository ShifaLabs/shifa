import "server-only";

import { collections, dbConnect } from "@/lib/dbConnect";

function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function confirmPaymentByTransactionId(transactionId: string) {
  if (!transactionId) {
    throw new Error("Transaction id is required");
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const result = await appointmentsCollection.findOneAndUpdate(
    {
      "payment.transactionId": transactionId,
      paymentStatus: { $ne: "paid" },
    },
    {
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
    },
    { returnDocument: "after" },
  );

  return serialize(result || null);
}
