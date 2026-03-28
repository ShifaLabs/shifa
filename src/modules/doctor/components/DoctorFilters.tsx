"use client";

import { Search, Filter, ArrowDownIcon, Stethoscope } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";

interface DoctorFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  department: string;
  setDepartment: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  uniqueDepartments: string[];
}

export default function DoctorFilters({
  search,
  setSearch,
  department,
  setDepartment,
  sort,
  setSort,
  uniqueDepartments,
}: DoctorFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 mb-4 p-2 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-800">
      {/* 1. Enhanced Search Input */}
      <div className="relative w-full group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2  h-4 text-zinc-400 group-focus-within:text-[#1F6F68] transition-colors" />
        <Input
          type="text"
          placeholder="Search doctors, specialists, or symptoms..."
          className="h-12 pl-12 pr-4 bg-white border-none rounded-[2rem] shadow-sm focus-visible:ring-2 focus-visible:ring-[#1F6F68]/20 text-sm font-medium dark:bg-zinc-950"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 2. Department Select */}
      <div className="w-full lg:w-72">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="h-14 bg-white border-none rounded-[2rem] shadow-sm focus:ring-2 focus:ring-[#1F6F68]/20 px-6 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#1F6F68]" />
              <SelectValue placeholder="All Departments" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
            <SelectItem value="all" className="rounded-lg">
              All Departments
            </SelectItem>
            {uniqueDepartments.map((spec, index) => (
              <SelectItem
                key={index}
                value={spec}
                className="rounded-lg capitalize"
              >
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 3. Sort Controls */}
      <div className="w-full lg:w-64">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="h-14 bg-white border-none rounded-[2rem] shadow-sm focus:ring-2 focus:ring-[#1F6F68]/20 px-6 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <ArrowDownIcon className="w-4 h-4 text-[#1F6F68]" />
              <SelectValue placeholder="Sort By" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-100 shadow-xl">
            <SelectItem value="recommended" className="rounded-lg">
              Recommended
            </SelectItem>
            <SelectItem value="rating" className="rounded-lg">
              Top Rated
            </SelectItem>
            <SelectItem value="fee" className="rounded-lg">
              Lowest Fee
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 4. Reset/Filter Icon (Optional Visual Polish) */}
      <div className="hidden lg:flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1F6F68] text-white shadow-lg shadow-[#1F6F68]/20 cursor-pointer hover:opacity-90 active:scale-95 transition-all">
        <Filter size={20} />
      </div>
    </div>
  );
}
