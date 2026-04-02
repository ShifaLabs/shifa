"use client";

import { useState } from "react";
import { Clock3, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerOverlay,
  DrawerTitle,
} from "@/shared/ui/drawer";
import { fetchDoctorPatientHistory } from "@/modules/doctor/appointment/services/doctor-appointments.client";
import { getReadableStatus } from "@/modules/doctor/appointment/utils/doctor-appointment.utils";
import type { PatientHistoryEntry } from "@/modules/doctor/appointment/types/doctor-appointment.types";

type Props = {
  patientId: string;
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

export default function DoctorPatientTimelineDrawer({
  patientId,
  patientName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PatientHistoryEntry[]>([]);

  const handleOpen = async (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen || !patientId) return;

    try {
      setLoading(true);
      setError("");
      const response = await fetchDoctorPatientHistory(patientId);
      setHistory(response.history || []);
    } catch (timelineError: any) {
      setError(timelineError?.message || "Failed to load patient timeline.");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        type="button"
        onClick={() => void handleOpen(true)}
      >
        <FileText className="size-4" />
        Timeline
      </Button>

      <Drawer open={open} onOpenChange={handleOpen} side="right">
        <DrawerOverlay />
        <DrawerContent className="w-full max-w-xl overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Patient Timeline</DrawerTitle>
            <DrawerDescription>
              Past consultations and symptom context for {patientName || "this patient"}.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-3 px-6 pb-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading timeline...</p>
            ) : error ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No consultation history found.
              </p>
            ) : (
              history.map((entry) => (
                <div key={entry._id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {entry.appointmentId || "Appointment"}
                    </p>
                    <Badge variant="outline">{getReadableStatus(entry.status)}</Badge>
                  </div>

                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    {formatDate(entry.appointmentDate)}
                  </p>

                  {entry.symptoms ? (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Symptoms:</span>{" "}
                      {entry.symptoms}
                    </p>
                  ) : null}

                  {entry.consultationSummary?.notes ? (
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Notes:</span>{" "}
                      {entry.consultationSummary.notes}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
