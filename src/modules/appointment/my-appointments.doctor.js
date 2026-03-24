"use server";

import { collections, dbConnect } from "@/infrastructure/db/dbConnect";
import { ObjectId } from "mongodb";

export async function getDoctorAppointmentsWithDetails(doctorId) {
  try {
    if (!doctorId || !ObjectId.isValid(doctorId)) {
      return [];
    }

    const appointmentCollection = await dbConnect(collections.APPOINTMENTS);

    const appointments = await appointmentCollection
      .aggregate([
        {
          $match: {
            doctor: new ObjectId(doctorId),
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
            _id: 1,
            appointmentId: 1,
            appointmentDate: 1,
            timeSlot: 1,
            consultationType: 1,
            symptoms: 1,
            status: 1,
            paymentStatus: 1,
            payment: 1,
            videoSession: 1,

            patientName: "$patientInfo.fullName",
            patientEmail: "$patientInfo.email",
            patientImage: "$patientInfo.profileImage",
          },
        },
      ])
      .toArray();

    return appointments.map((appointment) => {
      const id = appointment?._id?.toString?.();
      const consultationLink =
        appointment.consultationType === "video"
          ? appointment?.videoSession?.meetingLink ||
            (id ? `/consultation/${id}` : null)
          : null;

      return {
        ...appointment,
        _id: id,
        appointmentDate: appointment?.appointmentDate
          ? new Date(appointment.appointmentDate).toISOString()
          : null,
        appointmentDetailsPath: id
          ? `/dashboard/doctor/appointments/${id}`
          : null,
        consultationLink,
      };
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return [];
  }
}

export async function getConfirmedDoctorAppointments(doctorId) {
  return getDoctorAppointmentsWithDetails(doctorId);
}
