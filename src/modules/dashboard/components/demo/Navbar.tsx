// components/dashboard/Navbar.tsx
import React from "react";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-white/50 backdrop-blur-md sticky top-0 z-10">
      <h2 className="text-xl font-semibold text-slate-700">Dashboard</h2>

      <div className="flex items-center gap-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            className="pl-10 bg-slate-100/50 border-none rounded-full focus-visible:ring-1"
            placeholder="Search"
          />
        </div>

        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
          <span className="font-medium text-slate-700 text-sm">
            Dr. Aisha Rahman
          </span>
        </div>
      </div>
    </header>
  );
};
