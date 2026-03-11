"use client";

import { Shield } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="h-dvh w-full bg-linear-to-br from-[#0A0A0B] via-[#0F1419] to-[#0A0A0B] flex flex-col items-center justify-center gap-6 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#1F6F68]/10 blur-3xl animate-pulse" />
      <div
        className="absolute -right-32 -bottom-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      {/* Logo animation */}
      <div className="relative z-10">
        <div className="relative h-24 w-24 mb-4">
          {/* Outer orbit */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#1F6F68] border-r-[#1F6F68]/50 animate-spin"
            style={{ animationDuration: "3s" }}
          />

          {/* Middle orbit */}
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#1F6F68]/50 animate-spin"
            style={{ animationDuration: "2s", animationDirection: "reverse" }}
          />

          {/* Center badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-[#1F6F68]/20 blur-md" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#1F6F68] to-[#164e49]">
                <Shield className="h-7 w-7 text-emerald-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Joining Consultation
        </h1>
        <p className="text-sm text-white/50 font-medium max-w-xs">
          Securing your connection and initializing video stream
        </p>
      </div>

      {/* Loading indicator dots */}
      <div className="relative z-10 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-[#1F6F68] animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>

      {/* Progress text */}
      <div className="relative z-10 text-xs text-white/40 font-medium mt-6">
        Setting up secure WebRTC connection...
      </div>
    </div>
  );
}
