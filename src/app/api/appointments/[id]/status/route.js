import { collections, dbConnect } from "@/lib/dbConnect";
import { canTransition } from "@/lib/appointmentStateMachine";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/Auth/auth.config";

export async function PATCH(req, context) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { newStatus } = await req.json();

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

    const appointment = await appointmentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!appointment) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // Only allow owner (patient) or doctor
    const userId = session.user.id;

    const isPatientOwner = appointment.patient.toString() === userId;

    const isDoctorOwner = appointment.doctor.toString() === userId;

    if (!isPatientOwner && !isDoctorOwner) {
      return Response.json(
        { error: "Not allowed to modify this appointment" },
        { status: 403 },
      );
    }

    // Cancellation Rules
    if (newStatus === "Cancelled") {
      const now = new Date();
      const appointmentTime = new Date(appointment.appointmentDate);

      const oneHourBefore = new Date(
        appointmentTime.getTime() - 60 * 60 * 1000,
      );

      if (now > oneHourBefore) {
        return Response.json(
          { error: "Cannot cancel within 1 hour of appointment" },
          { status: 400 },
        );
      }

      if (
        appointment.status === "Completed" ||
        appointment.status === "Expired"
      ) {
        return Response.json(
          { error: "Cannot cancel this appointment" },
          { status: 400 },
        );
      }
    }

    // State Machine Check
    if (!canTransition(appointment.status, newStatus)) {
      return Response.json(
        { error: "Invalid status transition" },
        { status: 400 },
      );
    }

    await appointmentsCollection.updateOne(
      { _id: appointment._id },
      {
        $set: {
          status: newStatus,
          updatedAt: new Date(),
        },
        $push: {
          statusHistory: {
            from: appointment.status,
            to: newStatus,
            at: new Date(),
          },
        },
      },
    );

    return Response.json({
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
