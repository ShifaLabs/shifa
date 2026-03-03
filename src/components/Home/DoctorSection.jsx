import Image from "next/image";
import React from "react";
import Heading from "../Shared/Heading/Heading";
import MotionDiv from "../Shared/MotionDiv/MotionDiv";
import { getDoctors } from "@/features/appointments/appointments.doctors";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const doctors = [
  {
    name: "ডা. মোহাম্মদ হাসান",
    url: "https://daktarinfo.com/wp-content/uploads/2025/11/Dr.-Mohammad-Hasan-1-222x300.jpg",
    specialization: "মেডিসিন বিশেষজ্ঞ",
    experience: "১০ বছরের অভিজ্ঞতা",
    rating: 4.9,
    fee: 500, // ✅ added
    description: "রোগীদের মনোযোগ দিয়ে উন্নত চিকিৎসা সেবা প্রদান করেন।",
  },
  {
    name: "ডা. ফাতিমা রহমান",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzH7I-qHsnqnB12laEpF9gWtZsB121zvFiMg&s",
    specialization: "শিশু বিশেষজ্ঞ",
    experience: "৮ বছরের অভিজ্ঞতা",
    rating: 4.8,
    fee: 400, // ✅ added
    description: "শিশুদের যত্ন এবং রোগ নির্ণয় ক্ষেত্রে অভিজ্ঞ।",
  },
  {
    name: "ডা. আহমেদ জুলফিকার",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6FPponGVuX1E33kguZpJyfIhIT4Yoz8bUOg&s",
    specialization: "চর্মরোগ বিশেষজ্ঞ",
    experience: "১২ বছরের অভিজ্ঞতা",
    rating: 4.7,
    fee: 600, // ✅ added
    description: "ত্বকের সমস্যা দ্রুত এবং কার্যকরভাবে সমাধান করতে দক্ষ।",
  },
  {
    name: "ডা. সামিরা খাতুন",
    url: "http://doctorspedia.co/uploads/doctor/642e3be1e883c.gif",
    specialization: "মানসিক স্বাস্থ্য বিশেষজ্ঞ",
    experience: "৭ বছরের অভিজ্ঞতা",
    rating: 4.9,
    fee: 700, // ✅ added
    description: "মানসিক সুস্থতা এবং কাউন্সেলিংয়ে রোগীদের সমর্থন প্রদান করেন।",
  },
];

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

              <p className="text-center text-gray-500 mb-2">
                Rating: {doctor.rating} / 5
              </p>

              {/* ✅ Fees added (layout same, just one extra line) */}
              <p className="text-center text-gray-500 mb-3">
                Fees: ৳{doctor.fee}
              </p>

              <p className="text-gray-600 text-center">{doctor.description}</p>
            </div>
          </MotionDiv>
        ))}
      </div>
      <div className="flex justify-end mt-5">
        <Link
          className="flex justify-center items-center font-semibold text-gray-500"
          href={"/doctors"}
        >
          See more <ArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default DoctorsSection;