"use client";
import DoctorCard from "./DoctorCard";
import DoctorCardClientActions from "@/modules/appointment/components/DoctorCardClientActions";
import { useRouter } from "next/navigation";

export default function DoctorList({ doctors, session }) {
  const router = useRouter();
  if (!doctors.length) {
    return (
      <p className="text-sm text-gray-600">
        A list of doctors is not available at this time. Please try again later.
      </p>
    );
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor._id}
          doctor={doctor}
          onViewProfile={() => router.push(`/doctors/${doctor._id}`)}
        >
          <DoctorCardClientActions doctor={doctor} />
        </DoctorCard>
      ))}
    </div>
  );
}
