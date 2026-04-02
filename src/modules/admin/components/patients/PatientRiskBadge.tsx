"use client";

import { Badge } from "@/shared/ui/badge";
import { TrustLevel } from "@/modules/admin/types/patient-admin.types";

type Props = {
  riskLevel: TrustLevel;
  riskScore: number;
};

const CLASS_BY_RISK: Record<TrustLevel, string> = {
  low: "border-emerald-200 bg-emerald-100 text-emerald-700",
  medium: "border-amber-200 bg-amber-100 text-amber-700",
  high: "border-red-200 bg-red-100 text-red-700",
};

export default function PatientRiskBadge({ riskLevel, riskScore }: Props) {
  return (
    <Badge variant="outline" className={CLASS_BY_RISK[riskLevel]}>
      {riskLevel.toUpperCase()} ({riskScore})
    </Badge>
  );
}
