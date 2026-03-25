"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import type { DoctorAppointmentDetailResponse } from "../../types/doctor-appointment-detail.types";
import {
  fetchDoctorAppointmentDetail,
  saveDoctorAppointmentFollowUp,
} from "../../services/doctor-appointment-detail.client";
import type { SaveFollowUpPayload } from "../../types/doctor-appointment-detail.types";
import AppointmentDetailSkeleton from "./AppointmentDetailSkeleton";
import AppointmentHeaderCard from "./AppointmentHeaderCard";
import AppointmentTimelineCard from "./AppointmentTimelineCard";
import DoctorNotesPanel from "./DoctorNotesPanel";
import FollowUpInstructionPanel from "./FollowUpInstructionPanel";
import PatientProfileSummaryCard from "./PatientProfileSummaryCard";
import VideoSessionReadinessCard from "./VideoSessionReadinessCard";

type Props = {
  appointmentId: string;
};

export default function DoctorAppointmentDetailPageClient({
  appointmentId,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<DoctorAppointmentDetailResponse | null>(
    null,
  );

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchDoctorAppointmentDetail(appointmentId);
      setDetail(result);
    } catch (requestError: any) {
      setError(requestError?.message || "Failed to load appointment details.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleSaveFollowUp = useCallback(
    async (payload: SaveFollowUpPayload) => {
      await saveDoctorAppointmentFollowUp(appointmentId, payload);
      await loadDetail();
    },
    [appointmentId, loadDetail],
  );

  const content = useMemo(() => {
    if (!detail) return null;

    return (
      <div className="space-y-4">
        <AppointmentHeaderCard detail={detail} />

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <AppointmentTimelineCard detail={detail} />
            <DoctorNotesPanel detail={detail} />
          </div>

          <div className="space-y-4">
            <PatientProfileSummaryCard detail={detail} />
            <VideoSessionReadinessCard detail={detail} />
          </div>
        </div>

        <FollowUpInstructionPanel
          appointmentId={detail.appointment._id}
          followUps={detail.followUps}
          onSave={handleSaveFollowUp}
        />
      </div>
    );
  }, [detail, handleSaveFollowUp]);

  if (loading) {
    return <AppointmentDetailSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertTitle>Unable to load appointment detail</AlertTitle>
        <AlertDescription>
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => void loadDetail()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!detail) {
    return (
      <Alert>
        <AlertTitle>No detail found</AlertTitle>
        <AlertDescription>
          This appointment may not exist or you may not have access.
        </AlertDescription>
      </Alert>
    );
  }

  return content;
}
