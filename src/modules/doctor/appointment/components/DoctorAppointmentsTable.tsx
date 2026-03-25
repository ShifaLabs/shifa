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

export default function DoctorAppointmentsTable({
  appointments,
  onActionCompleted,
}: Props) {
  return (
    <Card className="hidden md:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Symptoms</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const dateTime = formatDateTime(
                  appointment.appointmentDateObject,
                );

                return (
                  <tr key={appointment._id} className="border-t align-top">
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {appointment.patientInfo.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.patientInfo.email || "No email"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      <p>{dateTime.date}</p>
                      <p>{dateTime.time}</p>
                    </td>
                    <td className="max-w-56 px-4 py-4 text-xs text-muted-foreground">
                      {appointment.symptoms || "No symptom summary"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          appointment.paymentStatusKey === "paid"
                            ? "default"
                            : appointment.paymentStatusKey === "unpaid"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {getPaymentLabel(appointment.paymentStatusKey)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-foreground">
                        {appointment.consultationType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={getStatusBadgeVariant(appointment.statusKey)}
                      >
                        {appointment.statusLabel}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <DoctorAppointmentActions
                        appointment={appointment}
                        onChanged={onActionCompleted}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
