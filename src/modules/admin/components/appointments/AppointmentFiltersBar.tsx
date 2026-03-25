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
  AppointmentDateRange,
  AppointmentPaymentStatusFilter,
  AppointmentSortBy,
  AppointmentStatusFilter,
} from "@/modules/admin/types/appointment-admin.types";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  status: AppointmentStatusFilter;
  onStatusChange: (value: AppointmentStatusFilter) => void;
  paymentStatus: AppointmentPaymentStatusFilter;
  onPaymentStatusChange: (value: AppointmentPaymentStatusFilter) => void;
  dateRange: AppointmentDateRange;
  onDateRangeChange: (value: AppointmentDateRange) => void;
  sortBy: AppointmentSortBy;
  onSortByChange: (value: AppointmentSortBy) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
};

export default function AppointmentFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  paymentStatus,
  onPaymentStatusChange,
  dateRange,
  onDateRangeChange,
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
          placeholder="Search by appointment ID, patient, or doctor"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) =>
          onStatusChange(value as AppointmentStatusFilter)
        }
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="PendingPayment">Pending Payment</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Confirmed">Confirmed</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
          <SelectItem value="Expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={paymentStatus}
        onValueChange={(value) =>
          onPaymentStatusChange(value as AppointmentPaymentStatusFilter)
        }
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Payment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={dateRange}
        onValueChange={(value) =>
          onDateRangeChange(value as AppointmentDateRange)
        }
      >
        <SelectTrigger className="w-full lg:col-span-2">
          <SelectValue placeholder="Date range" />
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
        onValueChange={(value) => onSortByChange(value as AppointmentSortBy)}
      >
        <SelectTrigger className="w-full lg:col-span-1">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="appointmentDate">Appointment Date</SelectItem>
          <SelectItem value="createdAt">Created At</SelectItem>
          <SelectItem value="updatedAt">Updated At</SelectItem>
          <SelectItem value="patientName">Patient</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortOrder}
        onValueChange={(value) => onSortOrderChange(value as "asc" | "desc")}
      >
        <SelectTrigger className="w-full lg:col-span-1">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Desc</SelectItem>
          <SelectItem value="asc">Asc</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
