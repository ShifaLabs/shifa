import DoctorListClient from "@/components/Doctors/DoctorListClient";
import Container from "@/components/Navigation/Navbar/Container/Container";
import Heading from "@/components/Shared/Heading/Heading";
import { getDoctors } from "@/features/appointments/appointments.doctors";
import { Suspense } from "react";

export default async function DoctorsPage() {
  // Fetching data on the server
  const response = await getDoctors();
  const initialDoctors = response?.data || [];

  return (
    <Container>
      <header className="text-center pt-5">
        <Heading
          title={"খুঁজুন বিশ্বাসযোগ্য ডাক্তার"}
          subtitle={"যাচাইকৃত পেশাদারদের মাধ্যমে বিশ্বমানের স্বাস্থ্যসেবা পান।"}
        />
      </header>
      {/* Pass server data to the Client Component */}
      <Suspense fallback={<DoctorsSkeleton />}>
        <DoctorListClient initialData={initialDoctors} />
      </Suspense>
    </Container>
  );
}

function DoctorsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-56 w-full bg-muted animate-pulse rounded-xl"
        />
      ))}
    </div>
  );
}
