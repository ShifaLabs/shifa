"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Camera,
  Loader2,
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import Logo from "@/components/Navigation/Shared/Logo/Logo";
import { imageUpload } from "@/lib/imageUpload";
import PageTransition from "@/components/ui/PageTransition";
import GoogleLoginButton from "@/components/features/Auth/GoogleLoginButton";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Create local preview
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let uploadedImageURL = "";
      if (file) {
        uploadedImageURL = await imageUpload(file);
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photoURL: uploadedImageURL,
          role: "patient",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full bg-slate-50/50 flex items-center justify-center p-0 sm:p-4 md:p-8 lg:p-12">
        <Card className="w-full max-w-275 border-none shadow-2xl rounded-none sm:rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-0 flex flex-col md:flex-row min-h-175">
            {/* Left Section: Info Panel */}
            <div className="hidden md:flex flex-1 flex-col justify-between p-12 bg-primary text-primary-foreground relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

              <Link
                href="/"
                className="z-10 inline-flex items-center gap-2 opacity-70 hover:opacity-100 transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back to SHIFA
              </Link>

              <div className="z-10 space-y-8">
                <div className="bg-white/10 backdrop-blur-md w-fit p-4 rounded-2xl border border-white/20">
                  <Logo
                    height={50}
                    width={50}
                    text="text-2xl text-white font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Start Your <br />{" "}
                    <span className="text-blue-200">Health Journey.</span>
                  </h1>
                  <p className="text-primary-foreground/80 text-lg font-light max-w-sm">
                    Create an account to book appointments and consult with
                    specialists securely.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    "Free medical history storage",
                    "Direct chat with specialists",
                    "Encrypted health records",
                  ].map((text, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-300" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="z-10 flex items-center gap-2 text-xs text-primary-foreground/50 font-medium">
                <ShieldCheck className="w-4 h-4" /> HIPAA & GDPR Compliant
              </div>
            </div>

            {/* Right Section: Registration Form */}
            <div className="flex-[1.2] flex flex-col justify-center px-6 py-12 sm:px-4 md:px-6 lg:px-8 bg-card">
              <div className="w-full max-w-sm mx-auto space-y-8">
                <header className="space-y-2 text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Join SHIFA
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Create your patient profile to get started
                  </p>
                </header>

                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Circular Image Upload Section */}
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="relative group">
                      <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-transform group-hover:scale-105">
                        <AvatarImage
                          src={previewUrl || ""}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          <User className="h-10 w-10" />
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors border-2 border-white"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Profile Photo
                    </Label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="fullName"
                          name="fullName"
                          required
                          placeholder="John Doe"
                          value={form.fullName}
                          onChange={handleChange}
                          className=" pl-10 h-12 rounded-xl focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={handleChange}
                          className="pl-10 h-12 rounded-xl focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Create Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={form.password}
                          onChange={handleChange}
                          className="pl-10 h-12 rounded-xl focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs font-medium text-center animate-shake">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-3 text-slate-400 font-bold tracking-widest">
                      Or join with
                    </span>
                  </div>
                </div>

                <GoogleLoginButton />

                <p className="text-center text-slate-500 text-sm">
                  Already a member?{" "}
                  <Link
                    href="/login"
                    className="text-primary font-bold hover:underline underline-offset-4"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
