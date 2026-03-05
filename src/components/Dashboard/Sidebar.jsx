/* eslint-disable react-hooks/static-components */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../Navigation/Shared/Logo/Logo";
import Image from "next/image";

export default function Sidebar({ navItems = [], user }) {
  const pathname = usePathname();
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
      <div className="px-6 pt-5">
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          {/* User Profile Header */}
          <div className="  mb-1 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl">
            <div className="flex items-center space-x-3">
              <AvatarIcon size="w-12 h-12" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mb-1">
                  {user.email}
                </p>
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
      {user.role === "patient" ? (
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
