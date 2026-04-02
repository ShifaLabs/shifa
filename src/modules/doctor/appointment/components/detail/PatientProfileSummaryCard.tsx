import { Mail, MapPin, Phone } from "lucide-react";
import type { DoctorAppointmentDetailResponse } from "../../types/doctor-appointment-detail.types";
import { getAddressLabel } from "../../utils/doctor-appointment-detail.utils";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  detail: DoctorAppointmentDetailResponse;
};

export default function PatientProfileSummaryCard({ detail }: Props) {
  const patient = detail.appointment.patientInfo;
  const [showFullEmail, setShowFullEmail] = useState(false);
  return (
    <Card className=" ">
      <CardHeader>
        <CardTitle className="text-base">Patient Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            {patient?.fullName || "Unknown patient"}
          </p>
          <p className="text-muted-foreground">
            {patient?.gender || "Gender not set"}
            {typeof patient?.age === "number" ? `, ${patient.age} years` : ""}
          </p>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <div className="space-y-2 text-muted-foreground">
            {/* Email */}
            <p
              onClick={() => setShowFullEmail(!showFullEmail)}
              className="inline-flex items-center gap-2 cursor-pointer max-w-full"
            >
              <Mail className="size-4 shrink-0" />

              <span
                className={`${
                  showFullEmail ? "whitespace-normal" : "truncate"
                } max-w-50`}
              >
                {patient?.email || "No email"}
              </span>
            </p>

            {/* Phone */}
            <p className="inline-flex items-center gap-2">
              <Phone className="size-4" />
              {patient?.phone || "No phone"}
            </p>

            {/* Address */}
            <p className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4" />
              <span>{getAddressLabel(patient?.address)}</span>
            </p>
          </div>
          <p className="inline-flex items-center gap-2">
            <Phone className="size-4" />
            {patient?.phone || "No phone"}
          </p>
          <p className="inline-flex items-start gap-2">
            <MapPin className="mt-0.5 size-4" />
            <span>{getAddressLabel(patient?.address)}</span>
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          History snippet:{" "}
          {detail.appointment.symptoms || "No symptom summary captured yet."}
        </div>
      </CardContent>
    </Card>
  );
}
