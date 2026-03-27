"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Stethoscope,
  MapPin,
  BadgeCheck,
  Video,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react";

// shadcn/ui components (assuming they are installed in your components/ui folder)
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/button";

interface DoctorCardProps {
  doctor: any;
  onViewProfile: () => void;
  children?: React.ReactNode;
}

export default function DoctorCard({
  doctor,
  onViewProfile,
  children,
}: DoctorCardProps) {
  const maleDoctorPlaceholder = "/male-doctor.png";
  const femaleDoctorPlaceholder = "/female-doctor.png";
  const fallback =
    doctor?.gender?.toLowerCase() === "female"
      ? femaleDoctorPlaceholder
      : maleDoctorPlaceholder;

  const [imgSrc, setImgSrc] = useState(doctor?.profileImage || fallback);
  return (
    <Card className="group overflow-hidden rounded-[2.5rem] border-zinc-100 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950">
      <CardContent className="p-6">
        {/* Top Row: Status & Verification */}
        <div className="flex items-center justify-between mb-5">
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none px-3 py-1 gap-1.5 rounded-full dark:bg-emerald-500/10 dark:text-emerald-400"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {doctor.status || "Active Now"}
          </Badge>

          {doctor.isVerified && (
            <div className="flex items-center gap-1 text-[#1F6F68]">
              <BadgeCheck className="w-5 h-5 fill-[#1F6F68] text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Main Identity: Horizontal Layout */}
        <div className="flex gap-5">
          <div className="relative shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-3xl ring-4 ring-primary/45  shadow-sm">
              <Image
                src={imgSrc}
                alt={doctor.fullName}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 bg-white/50"
                sizes="96px"
                priority={false}
                onError={() => setImgSrc(fallback)}
              />
            </div>
            {/* Telemedicine Badge */}
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#1F6F68] text-white shadow-lg border-4 border-white dark:border-zinc-950">
              <Video size={14} />
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center min-w-0">
            <h3 className="truncate text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Dr. {doctor.fullName}
            </h3>

            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="ml-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  4.9
                </span>
              </div>
              <span className="text-zinc-300 text-[10px]">•</span>
              <p className="text-xs font-semibold text-[#1F6F68] uppercase tracking-wide">
                {doctor.specialization}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-zinc-400 mt-2">
              <MapPin size={13} className="shrink-0" />
              <p className="text-[11px] font-medium truncate italic">
                {doctor.address?.city}, {doctor.address?.country}
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid: Financial & Credential */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-[1.5rem] bg-zinc-50/80 p-4 dark:bg-zinc-900/50">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              Consultation Fee
            </span>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
              ৳{doctor.consultationFee}
            </p>
          </div>
          <div className="space-y-0.5 border-l border-zinc-200 pl-4 dark:border-zinc-800">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
              Reg Number
            </span>
            <p className="truncate text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
              {doctor.licenseNumber || "N/A"}
            </p>
          </div>
        </div>
      </CardContent>

      {children || (
        <CardFooter className="px-6 pb-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            onClick={onViewProfile}
            className="flex-1 h-11 rounded-2xl text-xs font-bold border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800"
          >
            View Profile
          </Button>

          <Button className="flex-2 h-11 px-6 rounded-2xl bg-[#1F6F68] text-xs font-bold text-white shadow-lg shadow-[#1F6F68]/20 hover:bg-[#1F6F68]/90 transition-all active:scale-95 gap-2">
            Consult Now
            <ChevronRight size={14} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
