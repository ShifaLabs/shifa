// components/dashboard/DoctorCard.tsx
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { cn } from "@/lib/utils";
interface DoctorProps {
  name: string;
  specialty: string;
  image: string;
  borderColor: string;
}

export const DoctorCard = ({
  name,
  specialty,
  image,
  borderColor,
}: DoctorProps) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300 border border-slate-50">
      <div className="relative mb-4">
        <div className={cn("p-1 rounded-full border-2", borderColor)}>
          <div className="relative h-20 w-20 rounded-full overflow-hidden">
            <Image src={image} alt={name} fill className="object-cover" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-100">
          <Plus size={14} className="text-emerald-400" />
        </div>
      </div>
      <h4 className="font-bold text-slate-800 text-lg mb-1">{name}</h4>
      <p className="text-xs text-slate-400 mb-6 font-medium">{specialty}</p>
      <Button
        variant="outline"
        className="rounded-full px-6 py-2 h-9 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
      >
        View Profile
      </Button>
    </div>
  );
};
