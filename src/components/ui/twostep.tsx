/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Loader2,
  ChevronLeft,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EmailVerificationSuccess from "./EmailVerificationSuccess";

export default function TwoStep() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Auto-submit effect: Triggers when the 'code' array is completely filled
  useEffect(() => {
    const isComplete = code.every((digit) => digit !== "");
    if (isComplete && !loading) {
      handleVerify(code.join(""));
    }
  }, [code]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character
    setCode(newCode);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pasteData.some((char) => isNaN(Number(char)))) return;

    const newCode = [...code];
    pasteData.forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
  };

  const handleVerify = async (finalCode?: string) => {
    const codeStr = finalCode || code.join("");
    if (codeStr.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: codeStr }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Invalid verification code.");

      setIsVerified(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50/50 flex flex-col items-center justify-center p-4">
      {/* Back Link */}
      <Link
        href="/register"
        className="absolute top-8 left-8 hidden md:flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Register
      </Link>

      <Card className="w-full max-w-120 border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Medical Themed Icon */}
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-2">
              <Mail className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Verify your email
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                We&apos;ve sent a secure verification code to <br />
                <span className="font-semibold text-slate-900">{email}</span>
              </p>
            </div>

            {/* OTP Inputs */}
            <div className="w-full space-y-4">
              <div
                className="flex justify-between gap-2 sm:gap-3"
                onPaste={handlePaste}
              >
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`w-full h-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none
                      ${digit ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-slate-50 text-slate-900 focus:border-primary/50"}
                      ${error ? "border-destructive/50 bg-destructive/5" : ""}
                    `}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center justify-center gap-2 text-destructive text-xs font-bold animate-in fade-in slide-in-from-top-1">
                  <ShieldCheck className="w-3 h-3 rotate-180" /> {error}
                </div>
              )}
            </div>

            {/* Manual Verify Button */}
            <Button
              onClick={() => handleVerify()}
              disabled={loading || code.some((d) => d === "")}
              className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="flex flex-col items-center gap-4 pt-2">
              <p className="text-slate-500 text-sm">
                Didn&apos;t receive the code?
              </p>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-bold text-xs gap-2 border-slate-200"
              >
                <RefreshCcw className="w-3 h-3" /> Resend Code
              </Button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
              <ShieldCheck className="w-3 h-3" /> Secure Verification by SHIFA
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal/Overlay */}
      {isVerified && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-500">
          <EmailVerificationSuccess />
        </div>
      )}
    </div>
  );
}
