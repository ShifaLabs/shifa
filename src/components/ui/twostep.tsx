/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmailVerificationSuccess from "./EmailVerificationSuccess";

export default function TwoStep() {
  const [code, setCode] = useState<string[]>(new Array(6).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value)) || element.value === " ") {
      element.value = "";
      return;
    }
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    if (element.value && index < 5) {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newCode = new Array(6).fill("");
    for (let i = 0; i < pasteData.length; i++) {
      newCode[i] = pasteData[i];
    }
    setCode(newCode);

    const lastFullInput = Math.min(pasteData.length - 1, 5);
    inputRefs.current[lastFullInput]?.focus();
  };

  const handleSubmit = async () => {
    const codeStr = code.join("");
    if (codeStr.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!email) {
        throw new Error("Email not found. Please try registering again.");
      }

      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: codeStr }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Success: redirect or show message
      setIsVerified(true);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="flex items-center justify-center font-sans p-4">
      <div className="bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/20 max-w-md w-full text-center text-gray-900 dark:text-white relative overflow-hidden">
        {/* Mac-style dots */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <div className="w-3 h-3 bg-[#FF5F56] rounded-full"></div>
          <div className="w-3 h-3 bg-[#FFBD2E] rounded-full"></div>
          <div className="w-3 h-3 bg-[#27C93F] rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-center mb-4 mt-8 sm:mt-4">
            <div className="w-40 h-40 flex items-center justify-center">
              <img
                src="https://i.postimg.cc/SKSNJ5SQ/White-Letter-S-Logo-Instagram-Post.png"
                alt="Logo"
                className="w-32 h-32 object-cover rounded-lg drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    "https://placehold.co/128x128/161B22/FFFFFF?text=S";
                }}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-200">
            Sign In With Two-Step Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            We&apos;ve sent a 6 digit code to **********060
          </p>

          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm text-left font-medium">
            Enter the code you received
          </p>

          <div
            className="flex justify-center gap-2 sm:gap-3 mb-8"
            onPaste={handlePaste}
          >
            {code.map((data, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="tel"
                maxLength={1}
                value={data}
                placeholder="•"
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => {
                  e.target.select();
                  setFocusedIndex(index);
                }}
                onBlur={() => setFocusedIndex(-1)}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold bg-gray-50 dark:bg-[#0D1117] text-gray-900 dark:text-white rounded-lg outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600
                  ${
                    focusedIndex === index
                      ? "border-2 border-blue-500"
                      : "border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                  }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 mb-2 text-sm font-medium">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mb-4 w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Didn&apos;t receive a code?{" "}
            <button className="text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 font-semibold focus:outline-none focus:underline">
              Resend code
            </button>
          </p>
        </div>
      </div>
      {isVerified && <EmailVerificationSuccess />}
    </div>
  );
}
