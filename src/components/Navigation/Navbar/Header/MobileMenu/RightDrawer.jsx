"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "../../../../ui/drawer";
import {
  Menu,
  X,
  Home,
  UserRound,
  Stethoscope,
  FileText,
  LogOut,
  LogIn,
  UserPlus,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Doctor", href: "/doctor", icon: Stethoscope },
  { name: "Patient", href: "/patient", icon: UserRound },
  { name: "Prescription", href: "/prescription", icon: FileText },
  { name: "About", href: "/about", icon: Info },
];

export default function MobileNavDrawer({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 rounded-md transition-colors"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
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
              const isActive = pathname === link.href;

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
                  <LogOut className="w-4 h-4" />
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
                    <LogIn className="w-4 h-4 text-slate-500" />
                    Login
                  </Button>
                </Link>
                <Link
                  href="/register"
                  onClick={handleLinkClick}
                  className="w-full"
                >
                  <Button className="w-full gap-2 shadow-sm">
                    <UserPlus className="w-4 h-4" />
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
