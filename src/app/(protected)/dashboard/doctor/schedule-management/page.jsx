import { dbConnect, collections } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";
import ScheduleManager from "./ScheduleManager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/auth.config";

const days = [
  { label: "Sun", dayOfWeek: 0 },
  { label: "Mon", dayOfWeek: 1 },
  { label: "Tue", dayOfWeek: 2 },
  { label: "Wed", dayOfWeek: 3 },
  { label: "Thu", dayOfWeek: 4 },
  { label: "Fri", dayOfWeek: 5 },
  { label: "Sat", dayOfWeek: 6 },
];

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  // const doctorId = "69b64c20c5c00036c0804379";
  const doctorId = session.user.doctorId || session.user.id;

  const availabilityCollection = await dbConnect(
    collections.DOCTOR_AVAILABILITIES,
  );

  const existing = await availabilityCollection
    .find({ doctorId: new ObjectId(doctorId) })
    .toArray();

  const formatted = days.map((d) => {
    const found = existing.find((e) => e.dayOfWeek === d.dayOfWeek);

    return {
      ...d,
      enabled: !!found,
      startTime: found?.startTime || "09:00",
      endTime: found?.endTime || "17:00",
      slotDuration: found?.slotDuration || 30,
    };
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Schedule Management</h1>

      <ScheduleManager initialAvailability={formatted} doctorId={doctorId} />
    </div>
  );
}
