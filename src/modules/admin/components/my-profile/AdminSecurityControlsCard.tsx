"use client";

import { useState } from "react";
import { KeyRound, Shield } from "lucide-react";
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

type Props = {
  mfaEnabled: boolean;
  saving: boolean;
  onChangePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  onToggleMfa: (payload: {
    currentPassword: string;
    enabled: boolean;
  }) => Promise<void>;
};

export default function AdminSecurityControlsCard({
  mfaEnabled,
  saving,
  onChangePassword,
  onToggleMfa,
}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");

  const submitPasswordChange = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) return;

    await onChangePassword({
      currentPassword,
      newPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const submitMfaToggle = async () => {
    if (!reauthPassword) return;

    await onToggleMfa({
      currentPassword: reauthPassword,
      enabled: !mfaEnabled,
    });

    setReauthPassword("");
  };

  return (
    <Card className="p-4 md:p-6">
      <CardHeader>
        <CardTitle>Security Controls</CardTitle>
        <CardDescription>
          Sensitive updates require password re-authentication before applying
          changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-3" onSubmit={submitPasswordChange}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="size-4" />
            Change password
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminCurrentPassword">Current password</Label>
            <Input
              id="adminCurrentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminNewPassword">New password</Label>
            <Input
              id="adminNewPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminConfirmPassword">Confirm new password</Label>
            <Input
              id="adminConfirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword ? (
            <p className="text-sm text-destructive">Passwords do not match.</p>
          ) : null}

          <Button
            type="submit"
            disabled={
              saving ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword
            }
          >
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="rounded-lg border bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Shield className="size-4" />
            Multi-factor authentication
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            MFA is currently {mfaEnabled ? "enabled" : "disabled"}. Confirm your
            password to change this setting.
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              type="password"
              placeholder="Re-enter current password"
              value={reauthPassword}
              onChange={(event) => setReauthPassword(event.target.value)}
            />
            <Button
              type="button"
              variant={mfaEnabled ? "destructive" : "default"}
              onClick={submitMfaToggle}
              disabled={saving || !reauthPassword}
            >
              {saving
                ? "Applying..."
                : mfaEnabled
                  ? "Disable MFA"
                  : "Enable MFA"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
