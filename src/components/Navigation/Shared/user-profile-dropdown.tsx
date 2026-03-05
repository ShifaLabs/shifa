/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import {
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DropdownMenuProps {
  children: ReactNode;
  trigger: ReactNode;
}

const DropdownMenu = ({ children, trigger }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-3 w-72 rounded-2xl shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200 p-1.5"
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({
  children,
  onClick,
  variant = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "danger";
}) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
      variant === "danger"
        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-zinc-600 dark:text-zinc-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
    }`}
  >
    {children}
  </button>
);

export default function UserProfileDropdown({ user }: { user: any }) {
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const AvatarIcon = ({ size = "w-8 h-8" }) => (
    <div
      className={`${size} rounded-full ring-2 ring-primary/20 flex items-center justify-center bg-linear-to-tr from-[#1F6F68] to-[#9FD6B2] text-white font-bold overflow-hidden shadow-inner`}
    >
      {user.image ? (
        <Image
          src={user.image}
          alt="Profile"
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{user.name?.charAt(0) || "U"}</span>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu
        trigger={
          <button className="group flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-primary/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-300">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-primary transition-colors">
                {user.name || "Guest User"}
              </p>
              <p className="text-[10px] text-zinc-500   tracking-wider font-bold">
                {user.email}
              </p>
            </div>
            <AvatarIcon size="w-9 h-9" />
            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors" />
          </button>
        }
      >
        {/* User Profile Header */}
        <div className="px-4 py-4 mb-1 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl">
          <div className="flex items-center space-x-3">
            <AvatarIcon size="w-12 h-12" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {user.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-1">
                {user.email}
              </p>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase tracking-tighter">
                <Sparkles className="w-3 h-3 mr-1" />
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Action Groups */}
        <div className="space-y-0.5">
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <User className="mr-3 h-4 w-4 opacity-70" />
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-3 h-4 w-4 opacity-70" />
            Account Settings
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/billing")}>
            <CreditCard className="mr-3 h-4 w-4 opacity-70" />
            Plan & Billing
          </DropdownMenuItem>
        </div>

        <div className="my-1.5 h-px bg-zinc-200/60 dark:bg-zinc-800/60 mx-2" />

        <div className="space-y-0.5">
          <DropdownMenuItem onClick={() => router.push("/help")}>
            <HelpCircle className="mr-3 h-4 w-4 opacity-70" />
            Help Center
          </DropdownMenuItem>

          <DropdownMenuItem variant="danger" onClick={handleLogOut}>
            <LogOut className="mr-3 h-4 w-4 opacity-70" />
            Sign Out
          </DropdownMenuItem>
        </div>
      </DropdownMenu>
    </div>
  );
}
