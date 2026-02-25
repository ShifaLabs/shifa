"use client";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Stethoscope,
  Calendar,
  Award,
  ArrowLeft,
  FileText,
  MapIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DoctorDetailsPage = ({ doctor }: { doctor: any }) => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Search
          </Button>
        </div>
      </nav>

      <main className="container mx-auto mt-8 px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN: Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Profile Section */}
            <div className="rounded-3xl border border-border/50 bg-card p-8 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="relative mx-auto md:mx-0">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                    <AvatarImage
                      src={doctor.profileImage}
                      alt={doctor.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-bold bg-primary/5 text-primary">
                      {doctor.fullName
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {doctor.isVerified && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-blue-600 p-1.5 text-white shadow-lg ring-4 ring-background">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col items-center gap-2 md:flex-row md:justify-between">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                      {doctor.fullName}
                    </h1>
                    <Badge
                      className={
                        doctor.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 border-none"
                          : ""
                      }
                    >
                      {doctor.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="mt-2 flex items-center justify-center gap-2 text-lg font-medium text-primary md:justify-start">
                    <Stethoscope className="h-5 w-5" />
                    {doctor.specialization} Specialist
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-6 sm:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Experience
                      </p>
                      <p className="text-sm font-semibold">
                        {doctor.experienceYears} Years
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        License
                      </p>
                      <p className="text-sm font-semibold uppercase">
                        {doctor.licenseNumber}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Age
                      </p>
                      <p className="text-sm font-semibold">
                        {doctor.age} Years
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Gender
                      </p>
                      <p className="text-sm font-semibold capitalize">
                        {doctor.gender}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About / Credentials */}
            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <FileText className="h-5 w-5 text-primary" />
                  Professional Overview
                </div>
                <p className="leading-relaxed text-slate-600">
                  {doctor.fullName} is a dedicated {doctor.specialization}{" "}
                  specialist currently practicing in {doctor.address.city},{" "}
                  {doctor.address.country}. With over {doctor.experienceYears}{" "}
                  years of clinical experience, she has established a reputation
                  for excellence in patient care and medical diagnosis.
                </p>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Board Certified</h4>
                      <p className="text-sm text-muted-foreground">
                        Fully licensed to practice in {doctor.address.city}.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold">Member Since</h4>
                      <p className="text-sm text-muted-foreground">
                        Practicing since{" "}
                        {new Date(doctor.createdAt).getFullYear()}.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Sidebar Actions */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24 rounded-3xl border-none shadow-xl">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold">Contact & Booking</h3>
                  <p className="text-sm text-muted-foreground">
                    Available for in-person visits
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 transition-colors hover:bg-slate-100">
                    <MapPin className="mt-1 h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="font-bold">Clinic Address</p>
                      <p className="text-muted-foreground leading-snug">
                        {doctor.address.street},<br />
                        {doctor.address.city}, {doctor.address.zipCode}
                        <br />
                        {doctor.address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-4 py-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="font-medium">{doctor.phone}</span>
                  </div>

                  <div className="flex items-center gap-4 px-4 py-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="font-medium text-slate-600">
                      {doctor.email}
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <Button className="w-full h-12 text-md font-bold shadow-lg shadow-primary/20">
                    Request Appointment
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 font-bold flex gap-2"
                  >
                    <MapIcon className="h-4 w-4" /> Get Directions
                  </Button>
                </div>

                <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                  Last Updated:{" "}
                  {new Date(doctor.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorDetailsPage;
