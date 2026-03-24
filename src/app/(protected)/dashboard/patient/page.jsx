"use client";

import {
  Calendar,
  Activity,
  Pill,
  FileText,
  ArrowUpRight,
  Video,
  Plus,
  ArrowRight,
  Clock,
  Droplets,
  Thermometer,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

const PatientOverview = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 bg-background min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Welcome back, <span className="text-primary">Sojib</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Your health journey is looking positive today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200 dark:border-zinc-800 h-11 px-6 font-semibold"
          >
            Health Profile
          </Button>
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform font-bold bg-primary">
            <Plus className="mr-2 h-4 w-4" /> Book Consultation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Hero Card: Upcoming Session */}
          <Card className="border-none shadow-2xl bg-linear-to-br from-[#1F6F68] to-[#124541] text-white rounded-[2.5rem] overflow-hidden relative">
            <CardContent className="p-8 md:p-10 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse mr-2" />
                    Live Telemedicine Session
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                    Dr. Shourov Das <br />
                    <span className="text-secondary/90 font-medium text-2xl">
                      Cardiology Specialist
                    </span>
                  </h2>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary" />
                      <span className="text-sm">Today, Oct 24</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span className="text-sm">10:30 AM (15m left)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                  <Button className="w-full md:w-auto bg-white text-primary hover:bg-white/90 rounded-2xl px-8 h-14 font-bold shadow-xl">
                    <Video className="mr-2 h-5 w-5" /> Join Waiting Room
                  </Button>
                </div>
              </div>
            </CardContent>
            {/* Organic medical shapes background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          </Card>

          {/* Vitals Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Heart Rate",
                value: "72",
                unit: "bpm",
                icon: Heart,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Blood Sugar",
                value: "110",
                unit: "mg/dL",
                icon: Droplets,
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                label: "Body Temp",
                value: "36.6",
                unit: "°C",
                icon: Thermometer,
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                label: "Oxygen",
                value: "98",
                unit: "%",
                icon: Activity,
                color: "text-primary",
                bg: "bg-primary/10",
              },
            ].map((vital, i) => (
              <Card
                key={i}
                className="border-none shadow-sm rounded-3xl bg-white dark:bg-zinc-900"
              >
                <CardContent className="p-5">
                  <div
                    className={`${vital.bg} ${vital.color} w-10 h-10 rounded-2xl flex items-center justify-center mb-3`}
                  >
                    <vital.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-tight">
                    {vital.label}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-bold text-zinc-900 dark:text-white">
                      {vital.value}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400">
                      {vital.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily Medications */}
          <Card className="border-none shadow-sm p-5 rounded-[2rem] bg-white dark:bg-zinc-900 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Pill className="w-5 h-5 text-primary" />
                Medications
              </CardTitle>
              <span className="text-[10px] bg-primary/10 text-primary text-nowrap px-2 py-1 rounded-full font-bold">
                2 LEFT TODAY
              </span>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Atorvastatin",
                  dose: "20mg, 1 Tablet",
                  time: "08:00 AM",
                  taken: true,
                },
                {
                  name: "Metformin",
                  dose: "500mg, 1 Tablet",
                  time: "01:00 PM",
                  taken: false,
                },
                {
                  name: "Lisinopril",
                  dose: "10mg, 1 Tablet",
                  time: "09:00 PM",
                  taken: false,
                },
              ].map((med, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border transition-all ${med.taken ? "bg-zinc-50/50 border-transparent opacity-60" : "bg-white border-zinc-100 shadow-sm"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p
                        className={`text-sm font-bold ${med.taken ? "line-through" : "text-zinc-800"}`}
                      >
                        {med.name}
                      </p>
                      <p className="text-xs text-zinc-500 font-medium">
                        {med.dose}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-primary mb-1">
                        {med.time}
                      </p>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${med.taken ? "bg-primary border-primary text-white" : "border-zinc-200"}`}
                      >
                        {med.taken && <Plus className="w-3 h-3 rotate-45" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="ghost"
                className="w-full text-zinc-500 hover:text-primary font-bold text-xs gap-2"
              >
                View Full Schedule <ArrowRight className="w-3 h-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
