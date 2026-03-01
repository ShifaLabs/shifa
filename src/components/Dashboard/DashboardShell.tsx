"use client";

import { ReactNode, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ROLE_PERMISSIONS } from "@/config/role-permissions";
import { NAV_CONFIG } from "@/config/nav.config";
import { hasPermission } from "@/Types/permission.utils";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Loading from "@/app/loading";

interface DashboardShellProps {
  children: ReactNode;
}

const DashboardShell = ({ children }: DashboardShellProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") return <Loading />;

  if (!session) {
    router.push("/login");
    return null;
  }

  const role = session.user.role;
  const permissions = ROLE_PERMISSIONS[role];

  const navItems = useMemo(() => {
    const items = NAV_CONFIG[role].filter((item) =>
      hasPermission(permissions, item.requiredPermissions),
    );

    // ✅ Active state auto detect (no more manual active)
    return items.map((item) => ({
      ...item,
      active:
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname?.startsWith(item.href),
    }));
  }, [role, permissions, pathname]);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <Sidebar navItems={navItems} user={session.user} />

        <div className="flex-1 flex flex-col min-h-screen">
          <Header session={session} />
          <main className="p-4 sm:p-6 lg:p-8 bg-white">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;