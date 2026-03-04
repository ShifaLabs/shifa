// // components/dashboard/DoctorCard.tsx
// import React from "react";
// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";

// import { cn } from "@/lib/utils";
// interface DoctorProps {
//   name: string;
//   specialty: string;
//   image: string;
//   borderColor: string;
// }

// export const DoctorCard = ({
//   name,
//   specialty,
//   image,
//   borderColor,
// }: DoctorProps) => {
//   return (
//     <div className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all duration-300 border border-slate-50">
//       <div className="relative mb-4">
//         <div className={cn("p-1 rounded-full border-2", borderColor)}>
//           <div className="relative h-20 w-20 rounded-full overflow-hidden">
//             <Image src={image} alt={name} fill className="object-cover" />
//           </div>
//         </div>
//         <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-100">
//           <Plus size={14} className="text-emerald-400" />
//         </div>
//       </div>
//       <h4 className="font-bold text-slate-800 text-lg mb-1">{name}</h4>
//       <p className="text-xs text-slate-400 mb-6 font-medium">{specialty}</p>
//       <Button
//         variant="outline"
//         className="rounded-full px-6 py-2 h-9 text-xs font-semibold text-slate-600 border-slate-200 hover:bg-slate-50"
//       >
//         View Profile
//       </Button>
//     </div>
//   );
// };

import React from "react";
import { BadgeCheck, Stethoscope, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Doctor } from "@/Types/types";
import DoctorCardClientActions from "@/components/appointment/DoctorCardClientActions";

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (id: string) => void;
  onViewProfile: (id: string) => void;
}

export const DoctorCard = ({ doctor, onBook, onViewProfile }: DoctorCardProps) => {
  const isActive = doctor.status?.toLowerCase() === "active";

  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-border/50 bg-linear-to-b from-card to-muted/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Header/Top Accents */}
      <div className="absolute top-0 right-0 p-4">
        {doctor.isVerified && (
          <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-600 dark:text-blue-400">
            <BadgeCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase">Verified</span>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Identity */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse group-hover:scale-110 transition-transform" />
            <Avatar className="h-24 w-24 border-4 border-background ring-1 ring-border shadow-lg">
              <AvatarImage src={doctor.profileImage} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary">
                {doctor.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            {isActive && (
              <span className="absolute bottom-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {doctor.fullName}
            </h3>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
              <span className="text-sm font-medium uppercase tracking-wide">
                {doctor.specialization}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid (✅ Fee Added) */}
        <div className="mt-6 grid grid-cols-4 divide-x border-y border-border/50 py-3">
          <div className="flex flex-col items-center px-2">
            <span className="text-xs text-muted-foreground">Experience</span>
            <span className="font-semibold">{doctor.experienceYears}y+</span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-xs text-muted-foreground">Rating</span>
            <div className="flex items-center gap-1 font-semibold">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {/* {doctor.rating ?? 4.9} */}
            </div>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-xs text-muted-foreground">Fee</span>
            {/* <span className="font-semibold">৳{doctor.fee ?? "N/A"}</span> */}
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="text-xs text-muted-foreground">Location</span>
            <span className="font-semibold truncate w-full text-center">
              {doctor.address?.city ?? "—"}
            </span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-11 border-border/60 hover:bg-muted"
            onClick={() => onViewProfile?.(doctor._id)}
          >
            View Profile
          </Button>

          <DoctorCardClientActions doctor={doctor} />
        </div>
      </div>
    </Card>
  );
};