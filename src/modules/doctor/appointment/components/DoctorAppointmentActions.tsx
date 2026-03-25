"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, PhoneCall, UserX } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { DoctorAppointment } from "../types/doctor-appointment.types";
import {
  canCancelAppointment,
  canConfirmAppointment,
  canJoinVideoCall,
  canMarkNoShow,
} from "../utils/doctor-appointment.utils";
import { patchAppointmentStatus } from "../services/doctor-appointments.client";

type Props = {
  appointment: DoctorAppointment;
  onChanged: () => Promise<void>;
};

export default function DoctorAppointmentActions({
  appointment,
  onChanged,
}: Props) {
  const [pendingAction, setPendingAction] = useState<string>("");
  const [error, setError] = useState("");

  const runAction = async (newStatus: string) => {
    try {
      setPendingAction(newStatus);
      setError("");
      await patchAppointmentStatus(appointment._id, newStatus);
      await onChanged();
    } catch (actionError: any) {
      setError(actionError?.message || "Action failed");
    } finally {
      setPendingAction("");
    }
  };

  const canConfirm = canConfirmAppointment(appointment);
  const canCancel = canCancelAppointment(appointment);
  const canNoShow = canMarkNoShow(appointment);
  const canJoinCall = canJoinVideoCall(appointment);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {canConfirm ? (
          <Button
            type="button"
            size="sm"
            onClick={() => runAction("Confirmed")}
            disabled={Boolean(pendingAction)}
          >
            <CheckCircle2 className="size-4" />
            {pendingAction === "Confirmed" ? "Confirming..." : "Confirm"}
          </Button>
        ) : null}

        {canCancel ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => runAction("Cancelled")}
            disabled={Boolean(pendingAction)}
          >
            {pendingAction === "Cancelled" ? "Cancelling..." : "Cancel"}
          </Button>
        ) : null}

        {canNoShow ? (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => runAction("no-show")}
            disabled={Boolean(pendingAction)}
          >
            <UserX className="size-4" />
            {pendingAction === "no-show" ? "Saving..." : "Mark No-show"}
          </Button>
        ) : null}

        {canJoinCall ? (
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/consultation/${appointment._id}`}>
              <PhoneCall className="size-4" />
              Join/Start Call
            </Link>
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="inline-flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
