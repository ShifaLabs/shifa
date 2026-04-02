"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Loader2,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/shared/ui/card";
import Logo from "@/shared/components/Navigation/Shared/Logo/Logo";
import PageTransition from "@/shared/ui/PageTransition";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");

      setMessage({ type: "success", text: result.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full bg-slate-50/50 flex flex-col items-center justify-center p-4">
        {/* Back to Home Link */}
        <Link
          href="/login"
          className="absolute top-8 left-8 hidden md:flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="mb-8">
          <Logo height={60} width={60} text="text-3xl" />
        </div>

        <Card className="w-full max-w-112.5 border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white p-6">
          <CardHeader className="space-y-4 text-center pt-10">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <KeyRound className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Forgot Password?
              </CardTitle>
              <CardDescription className="text-slate-500">
                Enter your email and we&apos;ll send you instructions to reset
                your password.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-10">
            {message?.type === "success" ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-green-50 border border-green-100 text-green-800">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <p className="text-sm font-semibold text-center leading-relaxed">
                    {message.text}
                  </p>
                </div>
                <Button
                  asChild
                  className="w-full h-12 rounded-xl font-bold"
                  variant="outline"
                >
                  <Link href="/login">Return to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      {...register("email")}
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      className={`pl-10 h-12 rounded-xl focus-visible:ring-primary/20 ${
                        errors.email
                          ? "border-destructive ring-destructive"
                          : "border-slate-200"
                      }`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1 font-medium animate-in slide-in-from-top-1">
                      <AlertCircle className="h-3 w-3" /> {errors.email.message}
                    </p>
                  )}
                </div>

                {message?.type === "error" && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center">
                    {message.text}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Link <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm font-bold text-slate-500 hover:text-primary transition-colors"
                  >
                    I remember my password
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-slate-400 text-xs font-medium">
          Secure password recovery powered by SHIFA Health
        </p>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordForm;
