"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/shared/ui/drawer";
import { cn } from "@/infrastructure/lib/legacy/utils";
import { Button } from "@/shared/ui/button";
import { LayoutDashboard } from "lucide-react";

function IconBase({ children, className = "w-5 h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const MenuIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </IconBase>
);

const HomeIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </IconBase>
);

const StethoscopeIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M7 4v6a5 5 0 0 0 10 0V4" />
    <path d="M7 6H4" />
    <path d="M17 6h3" />
    <path d="M17 14a4 4 0 1 0 4 4" />
    <circle cx="21" cy="18" r="1" />
  </IconBase>
);

const BuildingIcon = ({ className }) => (
  <IconBase className={className}>
    <rect x="4" y="3" width="16" height="18" rx="1" />
    <path d="M8 7h2" />
    <path d="M14 7h2" />
    <path d="M8 11h2" />
    <path d="M14 11h2" />
    <path d="M8 15h2" />
    <path d="M14 15h2" />
  </IconBase>
);

const InfoIcon = ({ className }) => (
  <IconBase className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v6" />
    <path d="M12 7h.01" />
  </IconBase>
);

const FileTextIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v5h5" />
    <path d="M8 12h8" />
    <path d="M8 16h8" />
  </IconBase>
);

const LogOutIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
);

const LogInIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
  </IconBase>
);

const UserPlusIcon = ({ className }) => (
  <IconBase className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6" />
    <path d="M16 11h6" />
  </IconBase>
);

const NAV_LINKS = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Doctors", href: "/doctors", icon: StethoscopeIcon },
  { name: "Hospitals", href: "/nearby-hospitals", icon: BuildingIcon },
  { name: "About", href: "/about", icon: InfoIcon },
  { name: "Blogs", href: "/blogs", icon: FileTextIcon },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
];

export default function MobileNavDrawer({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const normalizePath = (path) => {
    if (!path) return "/";
    return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  };

  const normalizedPathname = normalizePath(pathname || "/");

  const handleLinkClick = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Open Menu"
      >
        <MenuIcon className="w-6 h-6" />
      </button>
      <Drawer open={isOpen} onOpenChange={setIsOpen} side="right">
        <DrawerOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60" />
        <DrawerContent
          className="bg-white fixed right-0 z-61 flex flex-col rounded-l-xl border-l outline-none"
          // This prevents the "breaking" during scroll/drag on side drawers
          style={{
            top: 0,
            bottom: 0,
            right: 0,
            height: "100vh",
            width: "auto",
            maxWidth: "100%",
          }}
        >
          <DrawerHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-xl font-bold">Shifa</DrawerTitle>
            </div>
            <DrawerDescription className="text-left">
              Healthcare Management System
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable Navigation Area */}
          <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive =
                mounted && normalizedPathname === normalizePath(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary" : "text-slate-400",
                    )}
                  />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Fixed Footer */}
          <div className="mt-auto p-4 border-t bg-slate-50/50">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {user.name || "Undefined"}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate">
                      {user.email || "john@example.com"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-slate-200"
                  >
                    <LogInIcon className="w-4 h-4 text-slate-500" />
                    Login
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={handleLinkClick}
                  className="w-full"
                >
                  <Button className="w-full gap-2 shadow-sm">
                    <UserPlusIcon className="w-4 h-4" />
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
