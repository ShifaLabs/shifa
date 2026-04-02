"use client";

import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  JoinedRange,
  ModerationFilter,
  PatientSortBy,
  PatientStatusFilter,
  TrustLevel,
} from "@/modules/admin/types/patient-admin.types";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  status: PatientStatusFilter;
  onStatusChange: (value: PatientStatusFilter) => void;
  moderation: ModerationFilter;
  onModerationChange: (value: ModerationFilter) => void;
  trustLevel: "all" | TrustLevel;
  onTrustLevelChange: (value: "all" | TrustLevel) => void;
  joinedRange: JoinedRange;
  onJoinedRangeChange: (value: JoinedRange) => void;
  sortBy: PatientSortBy;
  onSortByChange: (value: PatientSortBy) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
};

export default function PatientFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  moderation,
  onModerationChange,
  trustLevel,
  onTrustLevelChange,
  joinedRange,
  onJoinedRangeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: Props) {
  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <div className="relative lg:col-span-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search patient by name, email or phone"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as PatientStatusFilter)}
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={moderation}
        onValueChange={(value) => onModerationChange(value as ModerationFilter)}
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Moderation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All moderation</SelectItem>
          <SelectItem value="none">No moderation</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="banned">Banned</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={trustLevel}
        onValueChange={(value) =>
          onTrustLevelChange(value as "all" | TrustLevel)
        }
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Risk" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All risk</SelectItem>
          <SelectItem value="low">Low risk</SelectItem>
          <SelectItem value="medium">Medium risk</SelectItem>
          <SelectItem value="high">High risk</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={joinedRange}
        onValueChange={(value) => onJoinedRangeChange(value as JoinedRange)}
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Joined" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value) => onSortByChange(value as PatientSortBy)}
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Joined date</SelectItem>
          <SelectItem value="fullName">Name</SelectItem>
          <SelectItem value="updatedAt">Last update</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortOrder}
        onValueChange={(value) => onSortOrderChange(value as "asc" | "desc")}
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Descending</SelectItem>
          <SelectItem value="asc">Ascending</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
