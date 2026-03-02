import { collections, dbConnect } from "@/lib/dbConnect";
import { canTransition } from "@/lib/appointmentStateMachine";
import { ObjectId } from "mongodb";

export async function PATCH(req, context) {
  try {
    const { id } = await context.params;
    const { newStatus } = await req.json();

    if (!ObjectId.isValid(id)) {
      return Response.json(
        { error: "Invalid appointment ID" },
        { status: 400 },
      );
    }

    const appointmentsCollection = await dbConnect(collections.APPOINTMENTS);

    const appointment = await appointmentsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!appointment) {
      return Response.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Check if transition allowed
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
