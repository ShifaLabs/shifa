import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function updateDoctorAvailability(req) {
  try {
    const body = await req.json();
    const doctorId = new ObjectId(body.doctorId);

    const availabilityCollection = await dbConnect(
      collections.DOCTOR_AVAILABILITIES,
    );

    await availabilityCollection.deleteMany({ doctorId });

    const docs = body.availability.map((day) => ({
      doctorId,
      dayOfWeek: day.dayOfWeek,
      startTime: day.startTime,
      endTime: day.endTime,
      slotDuration: day.slotDuration,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (docs.length > 0) {
      await availabilityCollection.insertMany(docs);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 },
    );
  }
}
