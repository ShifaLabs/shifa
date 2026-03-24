"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, X, BellRing } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export default function AppointmentToast({
  message,
  type = "success",
  onClose,
  duration = 4000,
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Timer for auto-close
    const timer = setTimeout(() => onClose(), duration);

    // Smooth progress bar decrement
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - 100 / (duration / 10)));
    }, 10);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [onClose, duration]);

  if (typeof window === "undefined") return null;

  // Medical Theme Mapping
  const styles = {
    success: {
      bg: "bg-white dark:bg-zinc-900",
      border: "border-primary/20",
      icon: <CheckCircle2 className="h-5 w-5 text-[#1F6F68]" />,
      bar: "bg-[#1F6F68]",
      shadow: "shadow-[0_20px_50px_rgba(31,111,104,0.15)]",
    },
    error: {
      bg: "bg-white dark:bg-zinc-900",
      border: "border-destructive/20",
      icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      bar: "bg-destructive",
      shadow: "shadow-[0_20px_50px_rgba(239,68,68,0.15)]",
    },
    info: {
      bg: "bg-white dark:bg-zinc-900",
      border: "border-blue-200",
      icon: <BellRing className="h-5 w-5 text-blue-500" />,
      bar: "bg-blue-500",
      shadow: "shadow-[0_20px_50px_rgba(59,130,246,0.15)]",
    },
  }[type];

  return createPortal(
    <div className="fixed top-6 right-6 z-9999 animate-in fade-in slide-in-from-right-8 duration-500 ease-out">
      <div
        className={`relative flex items-center gap-4 min-w-[320px] max-w-md rounded-2xl border p-4 backdrop-blur-xl transition-all ${styles.bg} ${styles.border} ${styles.shadow}`}
      >
        {/* Progress Bar Loader */}
        <div className="absolute bottom-0 left-0 h-1 rounded-full overflow-hidden w-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-full transition-all linear ${styles.bar}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex shrink-0 items-center justify-center">
          {styles.icon}
        </div>

        <div className="flex-1 pr-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">
            System Notification
          </h4>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 leading-tight">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
        >
          <X className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
