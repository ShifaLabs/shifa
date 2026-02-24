"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROLE_PERMISSIONS } from "@/config/role-permissions";
import { NAV_CONFIG } from "@/config/nav.config";
import { hasPermission } from "@/Types/permission.utils";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardShellProps {
  children: ReactNode;
}

const DashboardShell = ({ children }: DashboardShellProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return <div>Loading...</div>;

  if (!session) {
    router.push("/login");
    return null;
  }

  const role = session.user.role;
  const permissions = ROLE_PERMISSIONS[role];

  // Get nav items allowed for this user
  const navItems = NAV_CONFIG[role].filter((item) =>
    hasPermission(permissions, item.requiredPermissions),
  );

  return (
    <div className="flex h-screen">
      <Sidebar navItems={navItems} />
      <div className="flex-1 flex flex-col">
        <Header session={session} />
        <main className="p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;
