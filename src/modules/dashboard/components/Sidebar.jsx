"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/shared/components/Navigation/Shared/Logo/Logo";
import Image from "next/image";
import UserProfile from "@/shared/components/Shared/UserProfile";

export default function Sidebar({ navItems = [], user }) {
  const pathname = usePathname();
  const safeUser = user || {};
  const userName = safeUser.name || "User";
  const userEmail = safeUser.email || "No email";
  const userRole = safeUser.role || "Member";
  const userImage = safeUser.image || null;
  const AvatarIcon = ({ size = "w-8 h-8" }) => (
    <div
      className={`${size} rounded-full ring-2 ring-primary/20 flex items-center justify-center bg-linear-to-tr from-[#1F6F68] to-[#9FD6B2] text-white font-bold overflow-hidden shadow-inner`}
    >
      {userImage ? (
        <Image
          src={userImage}
          alt="Profile"
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{userName?.charAt(0) || "U"}</span>
      )}
    </div>
  );
  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-200">
        <Logo width={44} height={44} text="text-2xl" />
        {/* <div className="leading-tight">
          <p className="text-lg font-semibold text-slate-900">Shifa</p>
          <p className="text-xs text-slate-500">Dashboard</p>
        </div> */}
      </div>

      {/* User card */}
      <div className="px-2 pt-2">
        <div className="relative group transition-all duration-300">
          {/* Subtle Glow Background */}
          <div className="absolute -inset-0.5 bg-linear-to-r from-[#1F6F68]/20 to-blue-500/10 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-500" />

          <div className="relative border border-zinc-200/60 dark:border-zinc-700/50 rounded-[2rem] p-2 bg-white dark:bg-zinc-900/90 backdrop-blur-xl shadow-sm">
            <div className="flex items-center gap-4">
              {/* Avatar Section with Status Ring */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-2 border-[#1F6F68]/20 animate-pulse" />
                <UserProfile name={userName} image={userImage} />
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500 z-20" />
              </div>

              {/* User Info & Role */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate tracking-tight">
                    {userName}
                  </p>
                </div>

                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate flex ">
                  <span className="  rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  {userEmail}
                </p>
                {/* Role Badge */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#1F6F68]/10 text-[#1F6F68] border border-[#1F6F68]/20">
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = (() => {
            if (!pathname) return false;

            const currentPath = pathname.split("/").filter(Boolean);
            const itemPath = item.href.split("/").filter(Boolean);

            // Exact match
            if (pathname === item.href) return true;

            // Match only if item path length is less than current
            if (currentPath.length > itemPath.length) {
              return false;
            }

            return pathname.startsWith(item.href);
          })();

          return (
            <Link
              key={item.label}
              href={item.href || "#"}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom card */}
      {userRole === "patient" ? (
        <div className="p-6">
          <div className="border border-slate-200 rounded-2xl p-5 bg-white">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quick Action
            </p>
            <p className="text-sm font-medium text-slate-900 mt-2">
              Book a new appointment quickly.
            </p>

            <Link
              href="/dashboard/patient/book"
              className="mt-4 inline-flex w-full justify-center items-center rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:opacity-90 transition"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      ) : (
        ""
      )}
    </aside>
  );
}
