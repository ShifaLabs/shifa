import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";
import { ApiResponse } from "@/infrastructure/lib/legacy/api";
import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

function isValidObjectId(value: unknown) {
  return ObjectId.isValid(String(value || ""));
}

function resolveDoctorCandidateIds(session: any) {
  const doctorUserId = session?.user?.id;
  const doctorProfileId = (session?.user as any)?.doctorId || null;

  return Array.from(new Set([doctorProfileId, doctorUserId].filter(Boolean)));
}

function resolveValidDoctorObjectIds(session: any) {
  const candidateIds = resolveDoctorCandidateIds(session);

  return candidateIds
    .filter((id) => isValidObjectId(id))
    .map((id) => new ObjectId(String(id)));
}

function getVideoJoinWindow(appointmentDate: Date | null) {
  if (!appointmentDate) {
    return {
      joinFrom: null,
      joinUntil: null,
      canJoinNow: false,
    };
  }

  const joinFrom = new Date(appointmentDate.getTime() - 10 * 60 * 1000);
  const joinUntil = new Date(appointmentDate.getTime() + 60 * 60 * 1000);
  const now = Date.now();

  return {
    joinFrom,
    joinUntil,
    canJoinNow: now >= joinFrom.getTime() && now <= joinUntil.getTime(),
  };
}

export async function handleGetDoctorAppointments(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return ApiResponse.unauthorized("Unauthorized");
  }
  const doctorObjectIds = resolveValidDoctorObjectIds(session);
  if (doctorObjectIds.length === 0) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }

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

  const doctorObjectIds = resolveValidDoctorObjectIds(session);
  if (doctorObjectIds.length === 0) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }
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

export async function handleGetDoctorAppointmentDetail(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiResponse.unauthorized("Unauthorized");
  }

  const resolvedParams =
    context?.params && typeof (context.params as any)?.then === "function"
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });

  const appointmentId = resolvedParams?.id;
  if (!appointmentId || !isValidObjectId(appointmentId)) {
    return ApiResponse.validationError("Validation failed", [
      { field: "id", message: "Invalid appointment id" },
    ]);
  }

  const doctorObjectIds = resolveValidDoctorObjectIds(session);
  if (doctorObjectIds.length === 0) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const followUpsCollection = await dbConnect(collections.FOLLOW_UPS);

  const rows = await appointmentsCollection
    .aggregate([
      {
        $match: {
          _id: new ObjectId(appointmentId),
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
          auditTrail: { $ifNull: ["$auditTrail", []] },
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
            gender: "$patientInfo.gender",
            age: "$patientInfo.age",
            address: "$patientInfo.address",
          },
        },
      },
    ])
    .toArray();

  const appointment = rows[0];
  if (!appointment) {
    return ApiResponse.notFound("Appointment");
  }

  const appointmentDate = appointment?.appointmentDate
    ? new Date(appointment.appointmentDate)
    : null;
  const safeAppointmentDate =
    appointmentDate && !Number.isNaN(appointmentDate.getTime())
      ? appointmentDate
      : null;

  const hasVideoMeetingLink = Boolean(appointment?.videoSession?.meetingLink);
  const hasCallId = Boolean(appointment?.videoSession?.callId);

  const fallbackVideoWindow = getVideoJoinWindow(safeAppointmentDate);

  const joinFrom = appointment?.videoSession?.joinFrom
    ? new Date(appointment.videoSession.joinFrom)
    : fallbackVideoWindow.joinFrom;
  const joinUntil = appointment?.videoSession?.joinUntil
    ? new Date(appointment.videoSession.joinUntil)
    : fallbackVideoWindow.joinUntil;

  const videoReadiness = {
    provider: appointment?.videoSession?.provider || "unknown",
    callId: appointment?.videoSession?.callId || null,
    meetingLink: appointment?.videoSession?.meetingLink || null,
    hasCallId,
    hasMeetingLink: hasVideoMeetingLink,
    joinFrom: joinFrom ? joinFrom.toISOString() : null,
    joinUntil: joinUntil ? joinUntil.toISOString() : null,
    canJoinNow:
      Boolean(joinFrom && joinUntil) &&
      Date.now() >= (joinFrom?.getTime() || 0) &&
      Date.now() <= (joinUntil?.getTime() || 0),
  };

  const followUps = await followUpsCollection
    .find({
      appointmentId: new ObjectId(appointmentId),
      doctorId: { $in: doctorObjectIds },
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .project({
      _id: 1,
      instructions: 1,
      notes: 1,
      nextVisitAt: 1,
      priority: 1,
      createdAt: 1,
      updatedAt: 1,
      createdByUserId: 1,
    })
    .toArray();

  return ApiResponse.success(
    {
      appointment,
      followUps: followUps.map((item) => ({
        _id: String(item._id),
        instructions: String(item.instructions || "").trim(),
        notes: String(item.notes || "").trim(),
        nextVisitAt: item.nextVisitAt
          ? new Date(item.nextVisitAt).toISOString()
          : null,
        priority: String(item.priority || "routine"),
        createdAt: item.createdAt
          ? new Date(item.createdAt).toISOString()
          : null,
        updatedAt: item.updatedAt
          ? new Date(item.updatedAt).toISOString()
          : null,
        createdByUserId: item.createdByUserId
          ? String(item.createdByUserId)
          : null,
      })),
      videoReadiness,
    },
    "Doctor appointment detail fetched successfully",
  );
}

export async function handleSaveDoctorAppointmentFollowUp(
  req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiResponse.unauthorized("Unauthorized");
  }

  const resolvedParams =
    context?.params && typeof (context.params as any)?.then === "function"
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });

  const appointmentId = resolvedParams?.id;
  if (!appointmentId || !isValidObjectId(appointmentId)) {
    return ApiResponse.validationError("Validation failed", [
      { field: "id", message: "Invalid appointment id" },
    ]);
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const instructions = String(body?.instructions || "").trim();
  const notes = String(body?.notes || "").trim();
  const priority = String(body?.priority || "routine")
    .trim()
    .toLowerCase();
  const nextVisitAtRaw = body?.nextVisitAt;

  if (!instructions && !notes) {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "instructions/notes",
        message: "At least instructions or notes must be provided",
      },
    ]);
  }

  const allowedPriorities = new Set(["routine", "important", "urgent"]);
  if (!allowedPriorities.has(priority)) {
    return ApiResponse.validationError("Validation failed", [
      {
        field: "priority",
        message: "Priority must be routine, important, or urgent",
      },
    ]);
  }

  let nextVisitAt: Date | null = null;
  if (nextVisitAtRaw) {
    const parsed = new Date(String(nextVisitAtRaw));
    if (Number.isNaN(parsed.getTime())) {
      return ApiResponse.validationError("Validation failed", [
        {
          field: "nextVisitAt",
          message: "Invalid next visit date",
        },
      ]);
    }
    nextVisitAt = parsed;
  }

  const doctorObjectIds = resolveValidDoctorObjectIds(session);
  if (doctorObjectIds.length === 0) {
    return ApiResponse.unauthorized("Missing authenticated doctor id");
  }
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const followUpsCollection = await dbConnect(collections.FOLLOW_UPS);

  const appointment = await appointmentsCollection.findOne({
    _id: new ObjectId(appointmentId),
    doctor: { $in: doctorObjectIds },
  });

  if (!appointment) {
    return ApiResponse.notFound("Appointment");
  }

  const createdAt = new Date();

  await followUpsCollection.insertOne({
    appointmentId: appointment._id,
    doctorId: appointment.doctor,
    patientId: appointment.patient,
    instructions,
    notes,
    priority,
    nextVisitAt,
    createdAt,
    updatedAt: createdAt,
    createdByUserId: String(session.user.id || ""),
  });

  const followUpAuditUpdate: any = {
    $set: { updatedAt: createdAt },
    $push: {
      auditTrail: {
        action: "Doctor follow-up saved",
        performedBy: "Doctor",
        from: appointment.status,
        to: appointment.status,
        at: createdAt,
      },
    },
  };

  await appointmentsCollection.updateOne(
    { _id: appointment._id },
    followUpAuditUpdate,
  );

  return ApiResponse.success(
    { saved: true },
    "Follow-up instructions saved successfully",
  );
}
