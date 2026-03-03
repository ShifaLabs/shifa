"use client";

import UserProfileDropdown from "../Navigation/Shared/user-profile-dropdown";

export default function Header({ session }) {
  return (
    <header className="h-20 border-b border-slate-200 bg-white sticky top-0 z-20">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center w-full max-w-xl">
          <div className="flex items-center w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
            <span className="material-icons-round text-slate-400 text-xl mr-2">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none"
              placeholder="Search appointments, patients..."
              type="text"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserProfileDropdown user={session.user} />
        </div>
      </div>
    </header>
  );
}