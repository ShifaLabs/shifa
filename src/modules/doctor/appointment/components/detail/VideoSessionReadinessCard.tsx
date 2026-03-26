import { ExternalLink, Video } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { DoctorAppointmentDetailResponse } from "../../types/doctor-appointment-detail.types";
import {
  formatDateTimeLabel,
  getVideoReadinessLabel,
} from "../../utils/doctor-appointment-detail.utils";

type Props = {
  detail: DoctorAppointmentDetailResponse;
};

export default function VideoSessionReadinessCard({ detail }: Props) {
  const readiness = detail.videoReadiness;

  return (
    <Card className="p-4 md:p-6">
      <CardHeader>
        <CardTitle className="text-base">Video Session</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={readiness.canJoinNow ? "default" : "outline"}>
            {readiness.canJoinNow ? "Ready" : "Pending"}
          </Badge>
          <Badge variant="secondary">
            Provider: {readiness.provider || "N/A"}
          </Badge>
          {readiness.callId ? (
            <Badge variant="outline">Call: {readiness.callId}</Badge>
          ) : null}
        </div>

        <p className="text-muted-foreground">
          {getVideoReadinessLabel(detail)}
        </p>

        <div className="grid gap-1 text-xs text-muted-foreground">
          <p>Join from: {formatDateTimeLabel(readiness.joinFrom)}</p>
          <p>Join until: {formatDateTimeLabel(readiness.joinUntil)}</p>
        </div>

        {readiness.meetingLink ? (
          <Button asChild variant="outline" size="sm" className="w-fit">
            <a href={readiness.meetingLink} target="_blank" rel="noreferrer">
              <Video className="size-4" />
              Open Meeting Link
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Meeting link not available yet. Confirm appointment to provision
            call metadata.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
