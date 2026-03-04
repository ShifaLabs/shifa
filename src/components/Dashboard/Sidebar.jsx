"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../Navigation/Shared/Logo/Logo";

export default function Sidebar({ navItems = [], user }) {
  const pathname = usePathname();

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-200">
        <Logo width={44} height={44} text="text-2xl" />
        <div className="leading-tight">
          <p className="text-lg font-semibold text-slate-900">Shifa</p>
          <p className="text-xs text-slate-500">Dashboard</p>
        </div>
      </div>

      {/* User card */}
      <div className="px-6 pt-5">
        <div className="border border-slate-200 rounded-2xl p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border overflow-hidden bg-slate-50">
              <img
                src={user?.image || "/shifa_logo.png"}
                alt={user?.name || "User"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <span className="inline-flex text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
              Role: {user?.role || "user"}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href || "#"}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom card */}
      <div className="p-6">
        <div className="border border-slate-200 rounded-2xl p-5 bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quick Action
          </p>
          <p className="text-sm font-medium text-slate-900 mt-2">
            Book a new appointment quickly.
          </p>

          <Link
            href="/dashboard/appointments/book"
            className="mt-4 inline-flex w-full justify-center items-center rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </aside>
  );
}