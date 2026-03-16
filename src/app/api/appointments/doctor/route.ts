import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import {
  ApiResponse,
  compose,
  withErrorHandling,
  withRateLimit,
  withRole,
} from "@/lib/api";
import { collections, dbConnect } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";

export async function handleGetDoctorAppointments(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return ApiResponse.unauthorized("Unauthorized");
  }
  const doctorUserId = session?.user?.id;
  console.log("Invalid doctor user id:", doctorUserId);

  if (!doctorUserId) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }

  if (!ObjectId.isValid(doctorUserId)) {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "session.user.id",
        message: "Invalid doctor id",
      },
    ]);
  }

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const appointments = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: new ObjectId(doctorUserId),
        },
      },
      {
        $lookup: {
          from: collections.USERS,
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
          _id: { $toString: "$_id" },
          appointmentId: 1,
          doctor: { $toString: "$doctor" },
          patient: { $toString: "$patient" },
          appointmentDate: 1,
          dateKey: 1,
          timeSlot: 1,
          status: 1,
          consultationType: 1,
          symptoms: 1,
          paymentStatus: 1,
          payment: {
            status: "$payment.status",
            amount: "$payment.amount",
            currency: "$payment.currency",
          },
          videoSession: {
            provider: "$videoSession.provider",
            callId: "$videoSession.callId",
            meetingLink: "$videoSession.meetingLink",
            joinFrom: "$videoSession.joinFrom",
            joinUntil: "$videoSession.joinUntil",
          },
          createdAt: 1,
          updatedAt: 1,
          patientInfo: {
            _id: {
              $cond: [
                { $ifNull: ["$patientInfo._id", false] },
                { $toString: "$patientInfo._id" },
                null,
              ],
            },
            fullName: "$patientInfo.fullName",
            email: "$patientInfo.email",
            phone: "$patientInfo.phone",
            profileImage: "$patientInfo.profileImage",
          },
        },
      },
      {
        $sort: {
          appointmentDate: -1,
        },
      },
    ])
    .toArray();

  return ApiResponse.success(
    {
      totalAppointments: appointments.length,
      appointments,
    },
    "Doctor appointments fetched successfully",
  );
}

export const GET = compose(
  withErrorHandling,
  withRole("doctor"),
  withRateLimit(60, 60_000),
)(handleGetDoctorAppointments);
