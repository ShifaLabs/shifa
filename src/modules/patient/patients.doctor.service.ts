import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";
import type { DoctorCommunicationPatient } from "./types/doctor-patient.types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function getFollowUpMetricsByPatient(doctorObjectId: ObjectId) {
  const followUpsCollection = await dbConnect(collections.FOLLOW_UPS);

  const rows = await followUpsCollection
    .find({ doctorId: doctorObjectId })
    .project({ patientId: 1, nextVisitAt: 1 })
    .toArray();

  const now = Date.now();
  const metrics = new Map<
    string,
    {
      followUpDueCount: number;
      followUpOverdueCount: number;
      nextFollowUpAt: Date | null;
    }
  >();

  for (const row of rows) {
    const patientId = row?.patientId ? String(row.patientId) : "";
    if (!patientId) continue;

    const current = metrics.get(patientId) || {
      followUpDueCount: 0,
      followUpOverdueCount: 0,
      nextFollowUpAt: null,
    };

    const visitDate = row?.nextVisitAt ? new Date(row.nextVisitAt) : null;

    if (visitDate && !Number.isNaN(visitDate.getTime())) {
      const visitTs = visitDate.getTime();

      if (visitTs < now - ONE_DAY_MS) {
        current.followUpOverdueCount += 1;
      } else if (visitTs <= now) {
        current.followUpDueCount += 1;
      }

      if (visitTs > now) {
        if (
          !current.nextFollowUpAt ||
          visitTs < current.nextFollowUpAt.getTime()
        ) {
          current.nextFollowUpAt = visitDate;
        }
      }
    }

    metrics.set(patientId, current);
  }

  return metrics;
}

function mergeFollowUpMetrics(
  patients: any[],
  metrics: Map<
    string,
    {
      followUpDueCount: number;
      followUpOverdueCount: number;
      nextFollowUpAt: Date | null;
    }
  >,
): DoctorCommunicationPatient[] {
  return patients.map((patient) => {
    const key = String(patient._id);
    const followUp = metrics.get(key);

    return {
      ...patient,
      _id: key,
      followUpDueCount: followUp?.followUpDueCount || 0,
      followUpOverdueCount: followUp?.followUpOverdueCount || 0,
      nextFollowUpAt: followUp?.nextFollowUpAt || null,
    };
  });
}

export async function getActivePatientsForDoctor(doctorId: string) {
  if (!doctorId || !ObjectId.isValid(doctorId)) {
    throw new Error("Valid doctor ID is required");
  }

  const doctorObjectId = new ObjectId(doctorId);
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const patients = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: doctorObjectId,
          appointmentDate: { $gte: new Date() },
          status: { $in: ["Approved", "Confirmed"] },
        },
      },
      {
        $sort: {
          appointmentDate: -1,
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
          phone: { $first: "$patient.phone" },
          profileImage: { $first: "$patient.profileImage" },

          nextAppointment: { $min: "$appointmentDate" },

          totalUpcoming: { $sum: 1 },
          lastSymptoms: { $first: "$symptoms" },
          lastConsultationType: { $first: "$consultationType" },
          hasVideoConsultation: {
            $max: {
              $cond: [
                {
                  $eq: [
                    { $toLower: { $ifNull: ["$consultationType", ""] } },
                    "video",
                  ],
                },
                1,
                0,
              ],
            },
          },
          nextVideoAppointment: {
            $min: {
              $cond: [
                {
                  $eq: [
                    { $toLower: { $ifNull: ["$consultationType", ""] } },
                    "video",
                  ],
                },
                "$appointmentDate",
                new Date("9999-12-31T00:00:00.000Z"),
              ],
            },
          },
        },
      },

      {
        $sort: { nextAppointment: 1 },
      },
    ])
    .toArray();

  const followUpMetrics = await getFollowUpMetricsByPatient(doctorObjectId);

  return mergeFollowUpMetrics(patients, followUpMetrics).map((patient) => ({
    ...patient,
    hasVideoConsultation: Boolean(patient.hasVideoConsultation),
    nextVideoAppointment:
      patient.nextVideoAppointment &&
      new Date(patient.nextVideoAppointment).getFullYear() < 9000
        ? patient.nextVideoAppointment
        : null,
  }));
}

export async function getPastPatientsForDoctor(doctorId: string) {
  if (!doctorId || !ObjectId.isValid(doctorId)) {
    throw new Error("Valid doctor ID is required");
  }

  const doctorObjectId = new ObjectId(doctorId);
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

  const patients = await appointmentsCollection
    .aggregate([
      {
        $match: {
          doctor: doctorObjectId,
          appointmentDate: { $lt: new Date() },
        },
      },
      {
        $sort: {
          appointmentDate: -1,
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
          phone: { $first: "$patient.phone" },
          profileImage: { $first: "$patient.profileImage" },

          lastVisit: { $max: "$appointmentDate" },

          totalVisits: { $sum: 1 },
          lastSymptoms: { $first: "$symptoms" },
          lastConsultationType: { $first: "$consultationType" },
        },
      },

      {
        $sort: { lastVisit: -1 },
      },
    ])
    .toArray();

  const followUpMetrics = await getFollowUpMetricsByPatient(doctorObjectId);

  return mergeFollowUpMetrics(patients, followUpMetrics);
}
