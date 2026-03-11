import "server-only";

import { collections, dbConnect } from "@/lib/dbConnect";
import { createCall, generateCallId } from "@/features/video/video.service";
import {
  buildConsultationLink,
  getJoinWindow,
} from "@/features/video/video.schedule";

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
          videoSession: 1,
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

  // First, get the appointment to check consultation type
  const appointment = await appointmentsCollection.findOne({
    "payment.transactionId": transactionId,
  });

  if (!appointment) {
    return null;
  }

  // Only update if not already paid (idempotent)
  if (appointment.paymentStatus !== "paid") {
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

    // Create video session automatically for video consultations
    if (appointment.consultationType === "video") {
      try {
        const callId =
          appointment?.videoSession?.callId ||
          generateCallId(appointment._id.toString());
        const meetingLink = buildConsultationLink(appointment._id.toString());
        const { joinFrom, joinUntil } = getJoinWindow(
          appointment.appointmentDate,
        );

        await createCall({
          callId,
          appointmentId: appointment._id.toString(),
          createdByUserId: appointment.patient.toString(),
          doctorId: appointment.doctor.toString(),
          patientId: appointment.patient.toString(),
        });

        updatePayload.$set.videoSession = {
          provider: "stream",
          ...(appointment.videoSession || {}),
          callId,
          meetingLink,
          joinFrom,
          joinUntil,
          createdAt: new Date(),
        };

        updatePayload.$push.auditTrail = {
          $each: [
            updatePayload.$push.auditTrail,
            {
              action: "Video session created",
              performedBy: "System",
              from: "Approved",
              to: "Approved",
              at: new Date(),
            },
          ],
        };
      } catch (videoError) {
        console.error("Failed to create video session:", videoError);
        // Continue with payment confirmation even if video creation fails
      }
    }

    await appointmentsCollection.findOneAndUpdate(
      {
        "payment.transactionId": transactionId,
        paymentStatus: { $ne: "paid" },
      },
      updatePayload,
      { returnDocument: "after" },
    );
  }

  const details = await getPaymentTransactionDetails(transactionId);
  return serialize(details || null);
}
