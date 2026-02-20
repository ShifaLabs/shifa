"use client";

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Star,
  MapPin,
  Clock,
  BadgeCheck,
  Filter,
} from "lucide-react";

const DOCTORS = [
  {
    id: "d1",
    name: "Dr. Michael Chen",
    specialization: "Cardiology",
    rating: 4.8,
    reviews: 312,
    location: "Los Angeles, USA",
    experienceYears: 12,
    fee: 150,
    availableToday: true,
    verified: true,
  },
  {
    id: "d2",
    name: "Dr. Aisha Rahman",
    specialization: "Dermatology",
    rating: 4.7,
    reviews: 198,
    location: "New York, USA",
    experienceYears: 9,
    fee: 90,
    availableToday: false,
    verified: true,
  },
  {
    id: "d3",
    name: "Dr. James Carter",
    specialization: "Orthopedics",
    rating: 4.6,
    reviews: 144,
    location: "San Francisco, USA",
    experienceYears: 11,
    fee: 120,
    availableToday: true,
    verified: false,
  },
];

export default function DoctorsPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");

  const filteredDoctors = useMemo(() => {
    let list = DOCTORS.filter((d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.specialization.toLowerCase().includes(query.toLowerCase())
    );

    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "fee") list.sort((a, b) => a.fee - b.fee);

    return list;
  }, [query, sort]);

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-6xl px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-gray-900">
            Find a Trusted Doctor
          </h1>
          <p className="mt-2 text-gray-600">
            Browse verified doctors and book secure online consultations.
          </p>
        </div>

        {/* Search & Sort */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or specialization..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          <div className="flex items-center gap-2 border rounded-lg px-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full h-11 bg-transparent outline-none text-sm"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Top Rated</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDoctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="border rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {doctor.name}
                    </h3>

                    {doctor.verified && (
                      <Badge className="bg-blue-50 text-blue-600 border border-blue-100">
                        <BadgeCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {doctor.specialization}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {doctor.rating} ({doctor.reviews})
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {doctor.location}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {doctor.experienceYears} yrs exp
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="text-xl font-semibold text-gray-900">
                    ${doctor.fee}
                  </p>

                  {doctor.availableToday ? (
                    <Badge className="mt-2 bg-green-50 text-green-600 border border-green-100">
                      Available Today
                    </Badge>
                  ) : (
                    <Badge className="mt-2 bg-gray-100 text-gray-600 border border-gray-200">
                      Next Available Soon
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Book Appointment
                </Button>
                <Button variant="outline" className="flex-1">
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}