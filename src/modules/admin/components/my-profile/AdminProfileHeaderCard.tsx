"use client";

import { ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardWithPadding,
} from "@/shared/ui/card";
import { AdminProfileData } from "@/modules/admin/types/profile-admin.types";

type Props = {
  profile: AdminProfileData;
  onRefresh: () => void;
  refreshing: boolean;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminProfileHeaderCard({
  profile,
  onRefresh,
  refreshing,
}: Props) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 via-card to-secondary/20 p-4 md:p-6 ">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-14 ring-2 ring-primary/20">
              <AvatarImage src={profile.profileImage || undefined} />
              <AvatarFallback>{getInitials(profile.fullName)}</AvatarFallback>
            </Avatar>

            <div>
              <CardTitle className="text-2xl tracking-tight">
                {profile.fullName}
              </CardTitle>
              <CardDescription className="mt-1">
                {profile.email}
              </CardDescription>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">Administrator</Badge>
                <Badge variant={profile.mfaEnabled ? "default" : "outline"}>
                  {profile.mfaEnabled ? (
                    <ShieldCheck className="size-3" />
                  ) : (
                    <ShieldAlert className="size-3" />
                  )}
                  {profile.mfaEnabled ? "MFA Enabled" : "MFA Disabled"}
                </Badge>
                <Badge variant="outline">
                  <Sparkles className="size-3" />
                  {profile.stats.actionsLast24h} actions in 24h
                </Badge>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total Actions
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {profile.stats.totalActions.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Last 24 Hours
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {profile.stats.actionsLast24h.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Last 7 Days
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {profile.stats.actionsLast7d.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
