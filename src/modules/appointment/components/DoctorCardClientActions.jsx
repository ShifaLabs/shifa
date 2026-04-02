"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { ChevronRight } from "lucide-react";
import BookAppointmentModal from "./BookAppointmentModal";
import { CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function DoctorCardClientActions({ doctor }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const onViewProfile = () => {
    router.push(`/doctors/${doctor._id}`);
  };
  return (
    <>
      <CardFooter className="flex gap-3 w-full">
        <Button
          variant="outline"
          onClick={onViewProfile}
          className=" flex-1 h-11 rounded-2xl text-xs font-bold border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800"
        >
          View Profile
        </Button>

        <Button
          onClick={() => setOpen(true)}
          className=" flex-1 h-11  rounded-2xl bg-[#1F6F68] text-xs font-bold text-white shadow-lg shadow-[#1F6F68]/20 hover:bg-[#1F6F68]/90 transition-all active:scale-95 "
        >
          Consult Now
          <ChevronRight size={14} />
        </Button>
      </CardFooter>
      <BookAppointmentModal doctor={doctor} open={open} setOpen={setOpen} />
    </>
  );
}
