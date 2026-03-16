"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
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
  const role = session?.user?.role;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const navItems = useMemo(() => {
    if (!role) return [];

    const permissions = ROLE_PERMISSIONS[role];

    const items = NAV_CONFIG[role].filter((item) =>
      hasPermission(permissions, item.requiredPermissions),
    );

    return items.map((item) => ({
      ...item,
      active:
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname?.startsWith(item.href),
    }));
  }, [role, pathname]);

  if (status === "loading") return <Loading />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed z-50 inset-y-0 left-0 transform bg-white transition-transform duration-300
          lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar navItems={navItems} user={session.user} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-screen w-full">
          {/* Header */}
          <Header session={session} onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-white">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardShell;
