import Image from "next/image";
import React from "react";
import Heading from "../Shared/Heading/Heading";
import MotionDiv from "../Shared/MotionDiv/MotionDiv";
import { getDoctors } from "@/features/appointments/appointments.doctors";

const DoctorsSection = async () => {
  const response = await getDoctors({ limit: 4, page: 1 });
  const initialDoctors = response?.data || [];

  return (
    <section className="py-16">
      <Heading
        title="আমাদের অভিজ্ঞ ডাক্তারগণ"
        subtitle="Shifa প্ল্যাটফর্মে বিভিন্ন চিকিৎসা ক্ষেত্রে দক্ষ ডাক্তাররা যুক্ত আছেন,
          যারা রোগীদের উন্নত এবং দায়িত্বশীল চিকিৎসা সেবা প্রদান করেন।"
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
        {initialDoctors.map((doctor, index) => (
          <MotionDiv key={index}>
            <div className="p-6 border rounded-xl shadow hover:shadow-2xl transition duration-300">
              <div className="relative h-32 w-32 rounded-full mx-auto mb-4 border overflow-hidden">
                <Image
                  src={doctor?.profileImage}
                  alt={doctor.fullName}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                {doctor.fullName}
              </h3>
              <p className="text-center text-gray-500 mb-2">
                {doctor.specialization}
              </p>
              <p className="text-center text-gray-500 mb-2">
                {doctor.experienceYears}
              </p>
              <p className="text-center text-gray-500 mb-3">
                Rating: {doctor.rating} / 5
              </p>
              <p className="text-gray-600 text-center">{doctor.description}</p>
            </div>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
};

export default DoctorsSection;
