import { Shield } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="h-dvh w-full bg-[#0A0A0B] flex flex-col items-center justify-center gap-6 text-white">
      {/* Animated logo mark */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 rounded-full border-4 border-[#1F6F68]/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#1F6F68]" />
        <div className="absolute inset-2.5 flex items-center justify-center rounded-full bg-[#1F6F68]/15">
          <Shield className="h-7 w-7 text-[#1F6F68]" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-white">
          Joining consultation…
        </p>
        <p className="mt-1 text-xs text-white/40">
          Setting up secure connection
        </p>
      </div>
      {/* Animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1F6F68]"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
