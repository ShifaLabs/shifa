"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  profileCompleted?: boolean;
}

export interface AuthSession {
  user: User;
  status: "authenticated" | "loading" | "unauthenticated";
}

/**
 * Custom hook for authentication with better typing
 */
export function useAuth(options?: { required?: boolean; redirectTo?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = status === "authenticated" && !!session;
  const isLoading = status === "loading";

  useEffect(() => {
    if (options?.required && status === "unauthenticated") {
      router.push(options.redirectTo || "/login");
    }
  }, [status, options?.required, options?.redirectTo, router]);

  return {
    user: session?.user as User | null,
    session,
    status,
    isAuthenticated,
    isLoading,
    isUnauthenticated: status === "unauthenticated",
  };
}

/**
 * Hook to check if user has specific role
 */
export function useRole(allowedRoles: string | string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const hasRole = user?.role ? roles.includes(user.role) : false;

  return {
    hasRole,
    isAuthenticated,
    isLoading,
    userRole: user?.role,
  };
}

/**
 * Hook to check if user has completed profile
 */
export function useProfileStatus() {
  const { user, isAuthenticated } = useAuth();

  return {
    isProfileComplete: user?.profileCompleted ?? false,
    needsProfileCompletion: isAuthenticated && !user?.profileCompleted,
  };
}
