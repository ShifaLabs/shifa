"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        const doctorsData = data?.data || data;
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      });
  }, []);

  // Search + Filter Logic
  useEffect(() => {
    let result = doctors;

    if (search) {
      result = result.filter((doctor) =>
        doctor.fullName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (specialization) {
      result = result.filter(
        (doctor) => doctor.specialization === specialization
      );
    }

    setFilteredDoctors(result);
  }, [search, specialization, doctors]);

  const uniqueSpecializations = [
    ...new Set(doctors.map((doc) => doc.specialization)),
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            আমাদের অভিজ্ঞ ডাক্তারগণ
          </h1>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="ডাক্তার খুঁজুন..."
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-4 py-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">সব বিভাগ</option>
            {uniqueSpecializations.map((spec, index) => (
              <option key={index} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="p-6 border rounded-xl shadow hover:shadow-xl transition duration-300"
            >
              <div className="relative h-32 w-32 rounded-full mx-auto mb-4 border overflow-hidden">
                <img
                  src={doctor.profileImage || "/shifa_logo.png"}
                  alt={doctor.fullName}
                  className="object-cover w-full h-full"
                />
              </div>

              <h3 className="text-lg font-semibold text-center mb-2">
                {doctor.fullName}
              </h3>

              <p className="text-center text-gray-500 text-sm mb-1">
                {doctor.specialization}
              </p>

              <p className="text-center text-gray-500 text-sm mb-3">
                {doctor.experienceYears
                  ? `${doctor.experienceYears} বছরের অভিজ্ঞতা`
                  : ""}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push(`/doctors/${doctor._id}`)}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100 transition"
                >
                  View Profile
                </button>

                <button
                  onClick={() =>
                    session
                      ? router.push(
                          `/dashboard/appointments/book?doctorId=${doctor._id}`
                        )
                      : router.push("/login")
                  }
                  className="px-3 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}