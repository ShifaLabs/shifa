"use client";

import React, { useState } from "react";
import { useForm, FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Stethoscope,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileBadge,
  Loader2,
  Clock,
  DollarSign,
  Check,
} from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const doctorFormSchema = z.object({
  // Personal Info
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid medical email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  gender: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(18, "Minimum age is 18").max(100),

  // Location
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),

  // Professional
  specialization: z.string().min(1, "Please select your specialization"),
  licenseNumber: z.string().min(5, "Valid license number is required"),

  // Availability & Billing
  consultationFee: z.coerce.number().min(0, "Fee cannot be negative"),
  availableDays: z.array(z.number()).min(1, "Please select at least one day"),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  slotDuration: z.coerce.number().min(15, "Minimum 15 mins").max(120),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min of ["00", "30"]) {
      const h = hour < 10 ? `0${hour}` : `${hour}`;
      times.push(`${h}:${min}`);
    }
  }
  return times;
};

interface SubmissionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export default function BecomeDoctorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema) as any,
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      gender: "male" as const,
      age: 30,
      street: "",
      city: "",
      country: "",
      zipCode: "",
      specialization: "",
      licenseNumber: "",
      consultationFee: 50,
      availableDays: [],
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 30,
    } as DoctorFormValues,
  });

  async function onSubmit(data: DoctorFormValues): Promise<void> {
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/doctors/become-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: SubmissionResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit application");
      }

      setSuccessMessage(
        result.message ||
          "Application Submitted Successfully! Awaiting admin approval.",
      );
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-zinc-50/50 ">
      <div className="  mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-[#1F6F68]/10 mb-4">
            <Stethoscope className="w-8 h-8 text-[#1F6F68]" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Join Shifa as a Provider
          </h1>
          <p className="text-zinc-500 mt-2">
            Apply to join our network of certified healthcare professionals.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-[#1F6F68] p-8 text-white">
            <CardTitle className="text-xl">
              Medical Credentialing Form
            </CardTitle>
            <CardDescription className="text-white/70">
              Please provide your professional details and availability for
              verification.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-10"
              >
                {/* Section 1: Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1F6F68] flex items-center gap-2">
                    <User className="w-4 h-4" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Dr. John Doe"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="doctor@shifa.com"
                              type="email"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="••••••••"
                              type="password"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Section 2: Contact & Address */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1F6F68] flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Contact & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 000-0000"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 Medical Plaza"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="New York"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="USA"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="10001"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Section 3: Professional Credentials */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1F6F68] flex items-center gap-2">
                    <FileBadge className="w-4 h-4" /> Professional Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select Field" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cardiology">
                                Cardiology
                              </SelectItem>
                              <SelectItem value="dermatology">
                                Dermatology
                              </SelectItem>
                              <SelectItem value="pediatrics">
                                Pediatrics
                              </SelectItem>
                              <SelectItem value="neurology">
                                Neurology
                              </SelectItem>
                              <SelectItem value="psychiatry">
                                Psychiatry
                              </SelectItem>
                              <SelectItem value="general">
                                General Practice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical License Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MED-12345678"
                              className="rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {/* Section 4: Availability & Billing */}
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#1F6F68] flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Availability & Billing
                  </h3>

                  {/* Multi-Day Selection: Modern Toggle Style */}
                  <FormField
                    control={form.control}
                    name="availableDays"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-zinc-700">
                          Available Working Days
                        </FormLabel>
                        <div className="flex flex-wrap gap-3">
                          {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ].map((day, idx) => {
                            const isSelected =
                              field.value?.includes(idx) ?? false;

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const currentDays = field.value ?? [];
                                  const nextDays = isSelected
                                    ? currentDays.filter((v) => v !== idx)
                                    : [...currentDays, idx];
                                  field.onChange(nextDays);
                                }}
                                className={`h-12 w-14 rounded-2xl border-2 transition-all duration-200 font-bold flex items-center justify-center ${
                                  isSelected
                                    ? "bg-[#1F6F68] text-white border-[#1F6F68] shadow-lg shadow-[#1F6F68]/20 scale-105"
                                    : "bg-white text-zinc-500 border-zinc-100 hover:border-[#1F6F68]/30 hover:bg-zinc-50"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Consultation Fee */}
                    <FormField
                      control={form.control}
                      name="consultationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Fee</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-100 p-1 rounded-md text-zinc-500 group-focus-within:text-[#1F6F68] transition-colors">
                                <DollarSign className="h-4 w-4" />
                              </div>
                              <Input
                                type="number"
                                className="pl-14 h-12 rounded-xl border-zinc-200 focus:border-[#1F6F68] focus:ring-[#1F6F68]"
                                placeholder="0.00"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Slot Duration */}
                    <FormField
                      control={form.control}
                      name="slotDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Duration</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={String(field.value || "")}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                                <SelectValue placeholder="Duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-zinc-200">
                              <SelectItem value="15">15 Minutes</SelectItem>
                              <SelectItem value="30">30 Minutes</SelectItem>
                              <SelectItem value="45">45 Minutes</SelectItem>
                              <SelectItem value="60">1 Hour Session</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shift Start - Modern Select Style */}
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift Start</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "09:00"}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-zinc-400" />
                                  <SelectValue placeholder="Start Time" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-80 rounded-xl">
                              {generateTimeOptions().map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Shift End - Modern Select Style */}
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shift End</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "17:00"}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-xl border-zinc-200">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-zinc-400" />
                                  <SelectValue placeholder="End Time" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-80 rounded-xl">
                              {generateTimeOptions().map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-2xl bg-[#1F6F68] hover:bg-[#154b46] text-lg font-bold shadow-xl shadow-[#1F6F68]/20 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Submitting Application...
                    </>
                  ) : (
                    "Complete Professional Registration"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-zinc-500 text-sm">
          By submitting this form, you agree to Shifa&apos;s medical vetting
          process and terms of service.
        </p>
      </div>
    </div>
  );
}
