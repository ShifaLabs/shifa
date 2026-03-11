import { dbConnect, collections } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import ScheduleManager from "./ScheduleManager";

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
  const doctorId = "69b1842d2f2b23cbd8238401";

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
