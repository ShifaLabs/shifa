import { collections, dbConnect } from "@/infrastructure/db/dbConnect";

const CONFIRMED_STATUSES = ["Confirmed", "confirmed"];

export async function markNoShowAppointments(now = new Date()) {
  const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);
  const threshold = new Date(now.getTime() - 15 * 60 * 1000);

  const result = await appointmentsCollection.updateMany(
    {
      status: { $in: CONFIRMED_STATUSES },
      appointmentDate: { $lt: threshold },
      $or: [
        { "videoSession.startedAt": { $exists: false } },
        { "videoSession.startedAt": null },
      ],
    },
    {
      $set: {
        status: "no-show",
        updatedAt: new Date(),
      },
    },
  );

  return result.modifiedCount;
}

