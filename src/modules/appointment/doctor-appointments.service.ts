import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

export async function handleGetDoctorAppointments(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return ApiResponse.unauthorized("Unauthorized");
  }
  const doctorUserId = session?.user?.id;
  const doctorProfileId = (session?.user as any)?.doctorId || null;

  const candidateIds = Array.from(
    new Set([doctorProfileId, doctorUserId].filter(Boolean)),
  );

  const invalidId = candidateIds.find((id) => !ObjectId.isValid(String(id)));

  if (invalidId) {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "session.user.id/session.user.doctorId",
        message: "Invalid doctor id",
      },
    ]);
  }

  if (candidateIds.length === 0) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }

  const doctorObjectIds = candidateIds.map((id) => new ObjectId(String(id)));

  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const appointments = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: { $in: doctorObjectIds },
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
          consultationSummary: 1,
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

export async function handleGetDoctorPatientHistory(
  _req: NextRequest,
  context: { params: Promise<{ patientId: string }> | { patientId: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiResponse.unauthorized("Unauthorized");
  }

  const resolvedParams =
    context?.params && typeof (context.params as any)?.then === "function"
      ? await (context.params as Promise<{ patientId: string }>)
      : (context.params as { patientId: string });

  const patientId = resolvedParams?.patientId;
  if (!patientId || !ObjectId.isValid(patientId)) {
    return ApiResponse.validationError("Validation failed", [
      { field: "patientId", message: "Invalid patient id" },
    ]);
  }

  const doctorUserId = session?.user?.id;
  const doctorProfileId = (session?.user as any)?.doctorId || null;
  const candidateIds = Array.from(
    new Set([doctorProfileId, doctorUserId].filter(Boolean)),
  );

  if (candidateIds.length === 0) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }

  const invalidId = candidateIds.find((id) => !ObjectId.isValid(String(id)));
  if (invalidId) {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "session.user.id/session.user.doctorId",
        message: "Invalid doctor id",
      },
    ]);
  }

  const doctorObjectIds = candidateIds.map((id) => new ObjectId(String(id)));
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: {
          patient: new ObjectId(patientId),
          doctor: { $in: doctorObjectIds },
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
          appointmentDate: 1,
          status: 1,
          consultationType: 1,
          symptoms: 1,
          consultationSummary: 1,
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
            endedAt: "$videoSession.endedAt",
            durationSeconds: "$videoSession.durationSeconds",
          },
          auditTrail: { $slice: ["$auditTrail", -8] },
          patientProfile: {
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
            gender: "$patientInfo.gender",
            age: "$patientInfo.age",
            profileImage: "$patientInfo.profileImage",
            address: "$patientInfo.address",
          },
          updatedAt: 1,
        },
      },
      { $sort: { appointmentDate: -1 } },
      { $limit: 20 },
    ])
    .toArray();

  const patientProfile = rows[0]?.patientProfile || null;

  const history = rows.map((item) => {
    const { patientProfile: _ignored, ...rest } = item;
    return rest;
  });

  return ApiResponse.success(
    { patient: patientProfile, history },
    "Patient consultation history fetched successfully",
  );
}
