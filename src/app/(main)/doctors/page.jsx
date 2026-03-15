"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DoctorCardClientActions from "@/components/appointment/DoctorCardClientActions";

function stableFeeFromId(id) {
  const fees = [500, 600, 700, 800, 900, 1000, 1200, 1500];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return fees[hash % fees.length];
}


export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState("recommended");


  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        const doctorsData = data?.data || data || [];

        const normalized = doctorsData.map((d) => ({
          ...d,
          rating:
            typeof d.rating === "number"
              ? d.rating
              : Number((4.5 + Math.random() * 0.5).toFixed(1)),
          fee:
            typeof d.fee === "number"
              ? d.fee
              : stableFeeFromId(String(d._id || Math.random())),
        }));

        setDoctors(normalized);
      });
  }, []);

  const uniqueDepartments = useMemo(() => {
    return [...new Set(doctors.map((doc) => doc?.specialization).filter(Boolean))];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d?.fullName?.toLowerCase().includes(q)
      );
    }

    if (department) {
      result = result.filter(
        (d) => d?.specialization === department
      );
    }

    if (sort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sort === "fee") {
      result.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    }

    return result;
  }, [doctors, search, department, sort]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            আমাদের অভিজ্ঞ ডাক্তারগণ
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            placeholder="ডাক্তার খুঁজুন..."
            className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border px-4 py-2 rounded-lg w-full md:w-64"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">সব বিভাগ</option>
            {uniqueDepartments.map((spec, index) => (
              <option key={index} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            className="border px-4 py-2 rounded-lg w-full md:w-64"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="rating">Top Rated</option>
            <option value="fee">Lowest Fee</option>
          </select>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="p-6 border rounded-xl shadow hover:shadow-2xl transition duration-300"
            >
              <div className="relative h-32 w-32 rounded-full mx-auto mb-4 border overflow-hidden">
                <img
                  src={doctor.profileImage || "/shifa_logo.png"}
                  alt={doctor.fullName}
                  className="object-cover w-full h-full"
                />
              </div>

              <h3 className="text-xl font-semibold text-center mb-2">
                {doctor.fullName}
              </h3>

              <p className="text-center text-gray-500 mb-2">
                {doctor.specialization}
              </p>

              <p className="text-center text-gray-500 mb-2">
                {doctor.experienceYears
                  ? `${doctor.experienceYears} বছরের অভিজ্ঞতা`
                  : "অভিজ্ঞতা: N/A"}
              </p>

              <p className="text-center text-gray-500 mb-2">
                Rating: {doctor.rating} / 5
              </p>

              <p className="text-center text-gray-500 mb-3">
                Fees: ৳{doctor.fee}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push(`/doctors/${doctor._id}`)}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100 transition"
                >
                  View Profile
                </button>

                {/* <button
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
                </button> */}
                <DoctorCardClientActions doctor={doctor} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}