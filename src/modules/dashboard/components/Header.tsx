"use client";

import { Menu } from "lucide-react";
import UserProfileDropdown from "../Navigation/Shared/user-profile-dropdown";

export default function Header({ session, onMenuClick }) {
  return (
    <header className="h-16 sm:h-20 border-b border-slate-200 bg-white sticky top-0 z-20">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left Section */}
        <div className="flex items-center gap-3 w-full">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>

          {/* Search */}
          <div className="flex items-center w-full max-w-xl bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <span className="material-icons-round text-slate-400 text-lg mr-2">
              search
            </span>

            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none"
              placeholder="Search appointments, patients..."
              type="text"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 shrink-0">
          <UserProfileDropdown user={session.user} />
        </div>
      </div>
    </header>
  );
}
