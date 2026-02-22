"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star, MapPin, Clock, BadgeCheck } from "lucide-react";

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
    verified: true,
    hospital: "Shifa Heart Center",
    bio: "Heart specialist with 12 years of experience in cardiac care and preventive cardiology.",
    education: ["MBBS", "MD (Cardiology)"],
    languages: ["English", "Bangla"],
    availability: "Mon–Thu • 10:00 AM – 6:00 PM",
    services: ["ECG Review", "BP Management", "Cardiac Risk Assessment"],
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
    verified: true,
    hospital: "Shifa Skin Clinic",
    bio: "Dermatologist focused on acne, allergy, and modern skin treatments.",
    education: ["MBBS", "DDV (Dermatology)"],
    languages: ["English"],
    availability: "Sun–Wed • 12:00 PM – 8:00 PM",
    services: ["Acne Treatment", "Allergy Consultation", "Skin Care Plan"],
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
    verified: false,
    hospital: "Shifa Ortho Care",
    bio: "Orthopedic surgeon for joint pain, sports injuries, and physiotherapy planning.",
    education: ["MBBS", "MS (Orthopedics)"],
    languages: ["English"],
    availability: "Tue–Fri • 9:00 AM – 5:00 PM",
    services: ["Joint Pain", "Sports Injury", "Physio Guidance"],
  },
];

export default function DoctorProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const doctor = useMemo(() => DOCTORS.find((d) => d.id === id), [id]);

  const goToBooking = () => {
    const target = `/dashboard/appointments/book?doctorId=${encodeURIComponent(
      id
    )}`;
    if (session) router.push(target);
    else router.push(`/login?callbackUrl=${encodeURIComponent(target)}`);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-white text-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h1 className="text-2xl font-semibold text-gray-900">
            Doctor not found
          </h1>
          <p className="mt-2 text-gray-600">
            This profile doesn’t exist or was removed.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => router.push("/doctors")}>
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push("/doctors")}>
            ← Back
          </Button>
        </div>

        <Card className="border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-semibold text-gray-900">
                  {doctor.name}
                </h1>

                {doctor.verified ? (
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-100">
                    <BadgeCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                    Pending Verification
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-gray-600">
                {doctor.specialization} • {doctor.hospital}
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

              <p className="mt-4 text-gray-700">{doctor.bio}</p>
            </div>

            <div className="md:text-right">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-2xl font-semibold text-gray-900">${doctor.fee}</p>

              <Button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 md:w-auto"
                onClick={goToBooking}
              >
                Book Appointment
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <InfoBlock title="Availability" value={doctor.availability} />
            <InfoBlock title="Languages" value={doctor.languages?.join(", ")} />
            <InfoBlock title="Education" value={doctor.education?.join(" • ")} />
            <InfoBlock title="Services" value={doctor.services?.join(" • ")} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-600">{value}</p>
    </div>
  );
}