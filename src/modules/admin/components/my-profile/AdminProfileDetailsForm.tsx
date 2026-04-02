"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  AdminProfileData,
  AdminProfileUpdatePayload,
} from "@/modules/admin/types/profile-admin.types";

type Props = {
  profile: AdminProfileData;
  saving: boolean;
  onSave: (payload: AdminProfileUpdatePayload) => Promise<void>;
};

const timezoneOptions = [
  "Asia/Dhaka",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "America/New_York",
  "UTC",
];

export default function AdminProfileDetailsForm({
  profile,
  saving,
  onSave,
}: Props) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone || "");
  const [profileImage, setProfileImage] = useState(profile.profileImage || "");
  const [timezone, setTimezone] = useState(profile.timezone || "Asia/Dhaka");
  const [productUpdates, setProductUpdates] = useState(
    profile.notifications.productUpdates,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    profile.notifications.securityAlerts,
  );
  const [moderationDigest, setModerationDigest] = useState(
    profile.notifications.moderationDigest,
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSave({
      fullName: fullName.trim(),
      phone: phone.trim() || null,
      profileImage: profileImage.trim() || null,
      timezone,
      notifications: {
        productUpdates,
        securityAlerts,
        moderationDigest,
      },
    });
  };

  return (
    <Card className="p-4 md:p-6">
      <CardHeader>
        <CardTitle>Identity and Preferences</CardTitle>
        <CardDescription>
          Keep your admin profile current for accurate audit attribution and
          timely security alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adminFullName">Full Name</Label>
              <Input
                id="adminFullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Admin name"
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email</Label>
              <Input id="adminEmail" value={profile.email} disabled readOnly />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Phone</Label>
              <Input
                id="adminPhone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+880..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminTimezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="adminTimezone" className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezoneOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminAvatar">Profile Image URL</Label>
            <Input
              id="adminAvatar"
              value={profileImage}
              onChange={(event) => setProfileImage(event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-medium">Notification preferences</p>
            <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={productUpdates}
                  onChange={(event) => setProductUpdates(event.target.checked)}
                />
                Product updates
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={securityAlerts}
                  onChange={(event) => setSecurityAlerts(event.target.checked)}
                />
                Security alerts
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={moderationDigest}
                  onChange={(event) =>
                    setModerationDigest(event.target.checked)
                  }
                />
                Moderation digest
              </label>
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
