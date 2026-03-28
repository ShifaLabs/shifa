import { Camera, CheckCircle2, ShieldAlert } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";

import { DoctorProfileApiData } from "../types/doctor-profile.types";
import { formatDateTime } from "../utils/doctor-profile.mappers";

type Props = {
  profileMeta: DoctorProfileApiData | null;
  displayImage: string;
  completionPercentage: number;
  isBusy: boolean;
  onSelectImageClick: () => void;
};

export default function DoctorProfileHeaderCard({
  profileMeta,
  displayImage,
  completionPercentage,
  isBusy,
  onSelectImageClick,
}: Props) {
  const statusBadgeVariant =
    profileMeta?.approvalStatus === "approved" ? "default" : "secondary";

  return (
    <Card className="border-slate-200">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border border-slate-200">
                <AvatarImage src={displayImage} alt="Doctor profile image" />
                <AvatarFallback>
                  {(profileMeta?.fullName || "DR")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={onSelectImageClick}
                disabled={isBusy}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                My Doctor Profile
              </h1>
              <p className="text-sm text-slate-600">
                Manage personal and professional details.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={statusBadgeVariant}>
                  {profileMeta?.approvalStatus || "pending"}
                </Badge>
                {profileMeta?.isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                    <ShieldAlert className="h-3.5 w-3.5" /> Not verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-55 space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Profile completion</span>
              <span className="font-medium text-slate-900">
                {completionPercentage}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Last updated: {formatDateTime(profileMeta?.updatedAt || null)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
