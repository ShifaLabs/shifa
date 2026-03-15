"use server";

import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function getConfirmedDoctorAppointments(doctorId) {
  try {
    const appointment = await dbConnect(collections.APPOINTMENTS);

    const appointments = await appointment
      .aggregate([
        {
          $match: {
            doctor: new ObjectId(doctorId),
            status: "Confirmed",
            paymentStatus: "paid",
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
          $unwind: "$patientInfo",
        },
        {
          $sort: {
            appointmentDate: -1,
          },
        },
        {
          $project: {
            appointmentId: 1,
            appointmentDate: 1,
            timeSlot: 1,
            consultationType: 1,
            symptoms: 1,
            meetingLink: 1,
            status: 1,
            paymentStatus: 1,

            patientName: "$patientInfo.fullName",
            patientEmail: "$patientInfo.email",
            patientImage: "$patientInfo.profileImage",
          },
        },
      ])
      .toArray();

    return appointments;
  } catch (error) {
    console.error("Error fetching confirmed doctor appointments:", error);
    return [];
  }
}
