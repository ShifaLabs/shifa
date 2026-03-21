// app/dashboard/page.tsx

import { Stethoscope, Calendar, LayoutGrid, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "./Navbar";
import { StatsCard } from "./StatsCard";
import { AppointmentCard } from "./AppointmentCard";
import { DoctorCard } from "./DoctorCard";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Stats and Mini Cal */}
            <div className="lg:col-span-8 space-y-8">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Upcoming Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard title="Total Patients" value="2,450" type="blue" />
                <StatsCard
                  title="Upcoming Appointments"
                  value="120"
                  type="teal"
                  icon={<Calendar size={20} className="opacity-60" />}
                />
                <StatsCard
                  title="Active Doctors"
                  value="45"
                  type="green"
                  icon={<Stethoscope size={20} className="opacity-60" />}
                />
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex items-center justify-center">
                  {/* Simplified Calendar Placeholder to match UI visual */}
                  <div className="grid grid-cols-7 gap-2 text-[10px] text-slate-400 font-bold">
                    {Array.from({ length: 31 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-6 h-6 flex items-center justify-center rounded-full",
                          i === 12 && "bg-blue-500 text-white",
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Management */}
            <div className="lg:col-span-4 bg-white/60 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">
                  Appointment Management
                </h3>
                <div className="flex gap-2">
                  <LayoutGrid size={18} className="text-slate-400" />
                  <Users size={18} className="text-slate-400" />
                </div>
              </div>

              <div className="space-y-4">
                <AppointmentCard
                  name="Mero Alixo Ronks"
                  time="12:45 PM"
                  type="Dentist"
                />
                <AppointmentCard
                  name="Aula'y Intoe Perner"
                  time="01:15 PM"
                  type="Skin"
                />
                <AppointmentCard
                  name="Tiken Abo Ronks"
                  time="02:30 PM"
                  type="Brain"
                />
                <AppointmentCard
                  name="Tizew Kel Uerieon"
                  time="04:00 PM"
                  type="Blood"
                />
              </div>

              <Button className="w-full mt-6 bg-[#10B981] hover:bg-[#059669] rounded-2xl h-12 font-bold shadow-lg shadow-emerald-200">
                View Details
              </Button>
            </div>
          </div>

          {/* Doctor Profiles Section */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                Doctor Profiles
              </h3>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400"
                >
                  <LayoutGrid size={18} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400"
                >
                  <Users size={18} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* <DoctorCard
                name="Dr. Imran Khan"
                specialty="Cardiologist"
                image="https://i.pravatar.cc/150?u=1"
                borderColor="border-blue-400"
              />
              <DoctorCard
                name="Dr. Imran Khan"
                specialty="Cardiologist"
                image="https://i.pravatar.cc/150?u=2"
                borderColor="border-emerald-400"
              />
              <DoctorCard
                name="Dr. Sofia Ahmed"
                specialty="Specialist"
                image="https://i.pravatar.cc/150?u=3"
                borderColor="border-slate-200"
              />
              <DoctorCard
                name="Dr. Sofia Ahmed"
                specialty="Pediatrician"
                image="https://i.pravatar.cc/150?u=4"
                borderColor="border-slate-100"
              /> */}
              {/* <DoctorCard
                doctor={{
                  _id: "1",
                  fullName: "Dr. Imran Khan",
                  specialization: "Cardiologist",
                  profileImage: "https://i.pravatar.cc/150?u=1",
                  experienceYears: 10,
                  status: "active",
                  isVerified: true,
                  address: { city: "Dhaka" },
                }}
                onBook={() => {}}
                onViewProfile={() => {}}
              /> */}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
