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

type Props = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  consultationType: string;
  onConsultationTypeChange: (value: string) => void;
};

export default function DoctorAppointmentFilters({
  searchTerm,
  onSearchTermChange,
  consultationType,
  onConsultationTypeChange,
}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search patient by name or email"
          className="pl-9"
        />
      </div>

      <Select value={consultationType} onValueChange={onConsultationTypeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Consultation type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All consultation types</SelectItem>
          <SelectItem value="video">Video</SelectItem>
          <SelectItem value="chat">Chat</SelectItem>
          <SelectItem value="voice">Voice</SelectItem>
          <SelectItem value="in-person">In-person</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
