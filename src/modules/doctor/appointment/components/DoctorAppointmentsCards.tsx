"use client";

import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import type { DoctorAppointment } from "../types/doctor-appointment.types";
import {
  formatDateTime,
  getPaymentLabel,
  getStatusBadgeVariant,
} from "../utils/doctor-appointment.utils";
import DoctorAppointmentActions from "./DoctorAppointmentActions";

type Props = {
  appointments: DoctorAppointment[];
  onActionCompleted: () => Promise<void>;
};

export default function DoctorAppointmentsCards({
  appointments,
  onActionCompleted,
}: Props) {
  return (
    <div className="grid gap-3 md:hidden">
      {appointments.map((appointment) => {
        const dateTime = formatDateTime(appointment.appointmentDateObject);

        return (
          <Card key={appointment._id}>
            <CardContent className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {appointment.patientInfo.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.patientInfo.email || "No email"}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(appointment.statusKey)}>
                  {appointment.statusLabel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>Date: {dateTime.date}</p>
                <p>Time: {dateTime.time}</p>
                <p>Type: {appointment.consultationType}</p>
                <p>Payment: {getPaymentLabel(appointment.paymentStatusKey)}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                Symptoms: {appointment.symptoms || "No symptom summary"}
              </p>

              <DoctorAppointmentActions
                appointment={appointment}
                onChanged={onActionCompleted}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
