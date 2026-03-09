import { authOptions } from "@/features/Auth/auth.config";
import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user logged in
    if (!session) {
      return Response.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 },
      );
    }

    const body = await req.json();

    const supportCollection = await dbConnect(collections.SUPPORT_TICKETS);

    // Generate Ticket ID
    const ticketId = `SHIFA-${Math.floor(100000 + Math.random() * 900000)}`;

    const ticket = {
      ticketId,
      userId: new ObjectId(session.user.id),
      name: body.name,
      email: body.email,
      role: body.role,
      subject: body.subject,
      message: body.message,
      priority: body.priority || "normal",

      status: "open",
      createdAt: new Date(),
    };

    await supportCollection.insertOne(ticket);

    // Send response to frontend
    return Response.json({
      success: true,
      ticketId,
      message: `Your ticket is ${ticketId}. We will connect you within 24 hours.`,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
