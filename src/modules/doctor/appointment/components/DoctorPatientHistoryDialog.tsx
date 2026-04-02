"use client";

import { useState } from "react";
import { Clock3, FileText, MapPin, Phone, Video } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import type {
  DoctorPatientHistoryResponse,
  PatientHistoryEntry,
} from "../types/doctor-appointment.types";
import { fetchDoctorPatientHistory } from "../services/doctor-appointments.client";
import {
  getReadableStatus,
  toPaymentStatusKey,
} from "../utils/doctor-appointment.utils";

type Props = {
  patientId: string | null;
  patientName: string;
};

function formatDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function DoctorPatientHistoryDialog({
  patientId,
  patientName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patient, setPatient] =
    useState<DoctorPatientHistoryResponse["patient"]>(null);
  const [history, setHistory] = useState<PatientHistoryEntry[]>([]);

  const handleOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen || !patientId) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const data = await fetchDoctorPatientHistory(patientId);
      setPatient(data.patient);
      setHistory(data.history || []);
    } catch (historyError: any) {
      setError(historyError?.message || "Failed to load patient history.");
      setPatient(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const patientAddress = [
    patient?.address?.street,
    patient?.address?.city,
    patient?.address?.country,
    patient?.address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={!patientId}>
          <FileText className="size-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Patient History</DialogTitle>
          <DialogDescription>
            Previous consultations for {patientName || "this patient"}.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading history...</p>
        ) : error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No consultation history found.
          </p>
        ) : (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-semibold text-foreground">
                {patient?.fullName || patientName || "Unknown patient"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {patient?.email ? <span>{patient.email}</span> : null}
                {patient?.phone ? (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5" />
                    {patient.phone}
                  </span>
                ) : null}
                {patient?.gender ? <span>{patient.gender}</span> : null}
                {typeof patient?.age === "number" ? (
                  <span>{patient.age} yrs</span>
                ) : null}
              </div>
              {patientAddress ? (
                <p className="mt-2 inline-flex items-start gap-1 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5" />
                  {patientAddress}
                </p>
              ) : null}
            </div>

            {history.map((item) => (
              <div key={item._id} className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {item.appointmentId || "Appointment"}
                  </p>
                  <Badge variant="outline">
                    {getReadableStatus(item.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {formatDate(item.appointmentDate)}
                  </span>
                  {item.consultationType ? (
                    <Badge variant="secondary" className="text-[11px]">
                      {item.consultationType}
                    </Badge>
                  ) : null}
                  {item.paymentStatus ? (
                    <Badge
                      variant={
                        toPaymentStatusKey(item.paymentStatus) === "paid"
                          ? "default"
                          : "outline"
                      }
                      className="text-[11px]"
                    >
                      Payment: {item.paymentStatus}
                    </Badge>
                  ) : null}
                  {item.videoSession?.callId ? (
                    <Badge variant="outline" className="text-[11px]">
                      <Video className="mr-1 size-3" />
                      {item.videoSession.callId}
                    </Badge>
                  ) : null}
                </div>

                {item?.symptoms ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Symptoms:
                    </span>{" "}
                    {item.symptoms}
                  </p>
                ) : null}

                {item?.consultationSummary?.medicines ? (
                  <p className="text-sm text-emerald-900">
                    <span className="font-semibold">Medicines:</span>{" "}
                    {item.consultationSummary.medicines}
                  </p>
                ) : null}

                {item?.consultationSummary?.notes ? (
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Notes:</span>{" "}
                    {item.consultationSummary.notes}
                  </p>
                ) : null}

                {Array.isArray(item.auditTrail) &&
                item.auditTrail.length > 0 ? (
                  <div className="rounded-md border bg-muted/20 p-2">
                    <p className="text-xs font-medium text-foreground">
                      Recent timeline
                    </p>
                    <div className="mt-1 space-y-1">
                      {item.auditTrail.slice(-3).map((audit, index) => (
                        <p
                          key={`${item._id}-audit-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          {String(audit.action || "Action")}
                          {audit.from || audit.to
                            ? ` (${audit.from || "-"} -> ${audit.to || "-"})`
                            : ""}
                          {audit.at ? ` at ${formatDate(audit.at)}` : ""}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
