"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function AppointmentToast({
  message,
  type = "success",
  onClose,
}) {
  useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed top-6 right-6 z-999999 animate-in fade-in slide-in-from-top-3 duration-300">
      <div
        className={`flex items-center gap-4 min-w-70 max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-md
        ${
          type === "success"
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0" />
        )}

        <p className="text-sm font-medium flex-1">{message}</p>

        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-background/50 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
