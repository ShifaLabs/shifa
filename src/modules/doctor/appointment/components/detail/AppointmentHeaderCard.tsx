import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorAppointmentDetailResponse } from "../../types/doctor-appointment-detail.types";
import {
  getReadableStatus,
  toPaymentStatusKey,
} from "../../utils/doctor-appointment.utils";
import { formatDateTimeLabel } from "../../utils/doctor-appointment-detail.utils";

type Props = {
  detail: DoctorAppointmentDetailResponse;
};

export default function AppointmentHeaderCard({ detail }: Props) {
  const appointment = detail.appointment;
  const paymentKey = toPaymentStatusKey(appointment.paymentStatus);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">Appointment Detail</CardTitle>
          <p className="text-sm text-muted-foreground">
            {appointment.appointmentId || appointment._id} |{" "}
            {formatDateTimeLabel(appointment.appointmentDate)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/doctor/appointments">Back to list</Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/consultation/${appointment._id}`}>
              Join consultation
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-2 pt-0">
        <Badge variant="outline">{getReadableStatus(appointment.status)}</Badge>
        <Badge variant="secondary">
          {appointment.consultationType || "Consultation"}
        </Badge>
        <Badge
          variant={
            paymentKey === "paid"
              ? "default"
              : paymentKey === "unpaid"
                ? "destructive"
                : "outline"
          }
        >
          Payment: {appointment.paymentStatus || "Unknown"}
        </Badge>
      </CardContent>
    </Card>
  );
}
