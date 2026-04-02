"use client";

import { useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import AdminProfileHeaderCard from "@/modules/admin/components/my-profile/AdminProfileHeaderCard";
import AdminProfileDetailsForm from "@/modules/admin/components/my-profile/AdminProfileDetailsForm";
import AdminSecurityControlsCard from "@/modules/admin/components/my-profile/AdminSecurityControlsCard";
import AdminSessionsCard from "@/modules/admin/components/my-profile/AdminSessionsCard";
import AdminActivityTimelineCard from "@/modules/admin/components/my-profile/AdminActivityTimelineCard";
import AdminQuickModerationCard from "@/modules/admin/components/my-profile/AdminQuickModerationCard";
import {
  changeAdminPasswordAction,
  getAdminProfileAction,
  getAdminSecurityActivityAction,
  getAdminSessionsAction,
  revokeSessionAction,
  runAdminQuickModerationAction,
  updateAdminMfaAction,
  updateAdminProfileAction,
} from "@/modules/admin/services/profile-admin.action";
import {
  AdminProfileData,
  AdminProfileUpdatePayload,
  AdminQuickModerationPayload,
  AdminSecurityEvent,
  AdminSessionItem,
} from "@/modules/admin/types/profile-admin.types";

const fallbackProfile: AdminProfileData = {
  _id: "",
  fullName: "Admin",
  email: "",
  phone: null,
  profileImage: null,
  timezone: "Asia/Dhaka",
  role: "admin",
  status: "active",
  moderationState: "none",
  createdAt: null,
  updatedAt: null,
  profileCompleted: false,
  mfaEnabled: false,
  notifications: {
    productUpdates: false,
    securityAlerts: true,
    moderationDigest: false,
  },
  stats: {
    totalActions: 0,
    actionsLast24h: 0,
    actionsLast7d: 0,
  },
};

export default function AdminProfilePageShell() {
  const [profile, setProfile] = useState<AdminProfileData>(fallbackProfile);
  const [events, setEvents] = useState<AdminSecurityEvent[]>([]);
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [sessionActionLoading, setSessionActionLoading] = useState(false);
  const [moderationLoading, setModerationLoading] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [profileResult, eventsResult, sessionsResult] = await Promise.all([
        getAdminProfileAction(),
        getAdminSecurityActivityAction(12),
        getAdminSessionsAction(6),
      ]);

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data);
      } else {
        toast.error(profileResult.message || "Failed to load profile");
      }

      if (eventsResult.success && Array.isArray(eventsResult.data)) {
        setEvents(eventsResult.data);
      }

      if (sessionsResult.success && Array.isArray(sessionsResult.data)) {
        setSessions(sessionsResult.data);
      }
    } catch (error) {
      console.error("Failed to load admin profile shell:", error);
      toast.error("Failed to load admin profile workspace");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveProfile = async (payload: AdminProfileUpdatePayload) => {
    try {
      setSavingProfile(true);
      const result = await updateAdminProfileAction(payload);
      if (!result.success) {
        toast.error(result.message || "Failed to update profile");
        return;
      }

      if (result.data) {
        setProfile(result.data);
      } else {
        await loadAll();
      }

      toast.success(result.message || "Profile updated");
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setSecuritySaving(true);
      const result = await changeAdminPasswordAction(payload);
      if (!result.success) {
        toast.error(result.message || "Failed to update password");
        return;
      }

      toast.success(result.message || "Password updated");
      await loadAll();
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password");
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleToggleMfa = async (payload: {
    currentPassword: string;
    enabled: boolean;
  }) => {
    try {
      setSecuritySaving(true);
      const result = await updateAdminMfaAction(payload);
      if (!result.success) {
        toast.error(result.message || "Failed to update MFA settings");
        return;
      }

      toast.success(result.message || "MFA updated");
      await loadAll();
    } catch (error) {
      console.error("Failed to update MFA:", error);
      toast.error("Failed to update MFA settings");
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setSessionActionLoading(true);
      const result = await revokeSessionAction(sessionId);
      if (!result.success) {
        toast.error(result.message || "Failed to revoke session");
        return;
      }

      toast.success(result.message || "Session updated");
      await loadAll();
    } catch (error) {
      console.error("Failed to revoke session:", error);
      toast.error("Failed to revoke session");
    } finally {
      setSessionActionLoading(false);
    }
  };

  const handleQuickModeration = async (
    payload: AdminQuickModerationPayload,
  ) => {
    try {
      setModerationLoading(true);
      const result = await runAdminQuickModerationAction(payload);
      if (!result.success) {
        toast.error(result.message || "Moderation action failed");
        return;
      }

      toast.success(result.message || "Moderation action applied");
      await loadAll();
    } catch (error) {
      console.error("Failed quick moderation:", error);
      toast.error("Moderation action failed");
    } finally {
      setModerationLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Toaster richColors position="top-right" />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Command-grade admin profile workspace for identity, security posture,
          and urgent moderation actions.
        </p>
      </div>

      <AdminProfileHeaderCard
        profile={profile}
        refreshing={loading}
        onRefresh={loadAll}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <AdminProfileDetailsForm
            key={`${profile._id}-${profile.updatedAt || ""}`}
            profile={profile}
            saving={savingProfile}
            onSave={handleSaveProfile}
          />
          <AdminQuickModerationCard
            loading={moderationLoading}
            onSubmit={handleQuickModeration}
          />
          <AdminActivityTimelineCard events={events} loading={loading} />
        </div>

        <div className="space-y-6">
          <AdminSecurityControlsCard
            mfaEnabled={profile.mfaEnabled}
            saving={securitySaving}
            onChangePassword={handleChangePassword}
            onToggleMfa={handleToggleMfa}
          />
          <AdminSessionsCard
            sessions={sessions}
            loading={loading}
            actionLoading={sessionActionLoading}
            onRevoke={handleRevokeSession}
          />
        </div>
      </div>
    </div>
  );
}
