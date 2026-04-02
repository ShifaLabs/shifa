import { completeAppointmentWithSummary } from "@/modules/appointment/complete-appointment.service";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } },
) {
  return completeAppointmentWithSummary(req, context);
}
