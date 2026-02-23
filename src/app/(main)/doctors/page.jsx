import DoctorListClient from "@/components/Doctors/DoctorListClient";
import { getDoctors } from "@/features/appointments/appointments.doctors";
import { Suspense } from "react";

export default async function DoctorsPage() {
  // Fetching data on the server
  const response = await getDoctors();
  const initialDoctors = response?.data || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <header className="mb-3">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
            Find a <span className="text-primary">Trusted</span> Doctor
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Access world-class healthcare with verified professionals.
          </p>
        </header>

        {/* Pass server data to the Client Component */}
        <Suspense fallback={<DoctorsSkeleton />}>
          <DoctorListClient initialData={initialDoctors} />
        </Suspense>
      </div>
    </div>
  );
}

// function DoctorsSkeleton() {
//   return (
//     <div className="grid gap-6 md:grid-cols-2">
//       {[...Array(6)].map((_, i) => (
//         <div
//           key={i}
//           className="h-56 w-full bg-muted animate-pulse rounded-xl"
//         />
//       ))}
//     </div>
//   );
// }
