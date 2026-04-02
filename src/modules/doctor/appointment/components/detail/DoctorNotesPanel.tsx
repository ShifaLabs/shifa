import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorAppointmentDetailResponse } from "../../types/doctor-appointment-detail.types";
import { formatDateTimeLabel } from "../../utils/doctor-appointment-detail.utils";

type Props = {
  detail: DoctorAppointmentDetailResponse;
};

export default function DoctorNotesPanel({ detail }: Props) {
  const summary = detail.appointment.consultationSummary;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Doctor Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {summary?.medicines ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Medicines
            </p>
            <p className="mt-1 text-emerald-900">{summary.medicines}</p>
          </div>
        ) : null}

        {summary?.notes ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Notes
            </p>
            <p className="mt-1 text-blue-900">{summary.notes}</p>
          </div>
        ) : null}

        {!summary?.medicines && !summary?.notes ? (
          <p className="text-muted-foreground">
            No consultation summary has been submitted yet.
          </p>
        ) : null}

        {summary?.submittedAt ? (
          <p className="text-xs text-muted-foreground">
            Submitted: {formatDateTimeLabel(summary.submittedAt)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
