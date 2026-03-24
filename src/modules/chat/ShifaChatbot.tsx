"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MoreHorizontal,
  HelpCircle,
} from "lucide-react";

type Role = "bot" | "user";

interface ChatDoctor {
  id: string;
  fullName: string;
  specialization?: string;
  consultationFee?: number;
  experienceYears?: number;
  rating?: number;
  profileImage?: string;
}

interface ChatMessage {
  role: Role;
  content: string;
  specialization?: string | null;
  urgency?: "low" | "medium" | "high";
  reason?: string;
  doctors?: ChatDoctor[];
}

interface ChatApiResponse {
  success: boolean;
  message?: string;
  specialization?: string | null;
  urgency?: "low" | "medium" | "high";
  reason?: string;
  doctors?: ChatDoctor[];
}

export default function ShifaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "Hi. I'm the Shifa Assistant. Share your symptoms and I will suggest a relevant specialist.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    const userInput = message.trim();
    if (!userInput || isSending) return;

    setHistory((prev) => [...prev, { role: "user", content: userInput }]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userInput,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data: ChatApiResponse = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Chat request failed");
      }

      setHistory((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            data.message ||
            "Thanks for sharing your symptoms. Here is what I found.",
          specialization: data.specialization,
          urgency: data.urgency,
          reason: data.reason,
          doctors: Array.isArray(data.doctors) ? data.doctors : [],
        },
      ]);
    } catch (error) {
      console.error("AI request failed:", error);
      setHistory((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            "I could not process your request right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-1000 flex flex-col items-end sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            /* KEY FIX: 
              h-[calc(100vh-120px)] ensures it stays within view regardless of zoom/height.
              max-h-[600px] keeps it from looking too stretched on massive screens.
            */
            className="mb-4 flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:border-zinc-800 dark:bg-[#191919] 
                       h-[calc(100vh-120px)] max-h-200 sm:w-95"
          >
            {/* Header - Fixed height */}
            <div className="flex shrink-0 items-center justify-between border-b bg-background border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#1F6F68]/10 dark:bg-[#1F6F68]/20">
                  <Sparkles size={14} className="text-[#1F6F68]" />
                </div>
                <span className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Shifa AI Assistant
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded text-zinc-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Chat Content - This expands to fill remaining height */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar scroll-smooth"
            >
              <AnimatePresence mode="popLayout">
                {history.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="flex flex-col gap-2"
                  >
                    {/* Role Header */}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400/80">
                      {msg.role === "bot" ? "Assistant" : "You"}
                    </span>

                    {/* Message Content */}
                    <div
                      className={`text-[14px] leading-relaxed ${
                        msg.role === "user"
                          ? "text-zinc-900 dark:text-white font-medium"
                          : "text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* AI Metadata Badges */}
                    {msg.role === "bot" &&
                      (msg.specialization || msg.urgency) && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-wrap gap-2"
                        >
                          {msg.specialization && (
                            <span className="inline-flex items-center rounded-full bg-[#1F6F68]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#1F6F68] ring-1 ring-inset ring-[#1F6F68]/20">
                              {msg.specialization}
                            </span>
                          )}
                          {msg.urgency && (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                                msg.urgency === "high"
                                  ? "bg-red-50 text-red-700 ring-red-600/20"
                                  : "bg-amber-50 text-amber-700 ring-amber-600/20"
                              }`}
                            >
                              {msg.urgency} Urgency
                            </span>
                          )}
                        </motion.div>
                      )}

                    {/* Reason Text */}
                    {msg.role === "bot" && msg.reason && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[12px] italic text-zinc-500 dark:text-zinc-400"
                      >
                        Note: {msg.reason}
                      </motion.p>
                    )}

                    {/* Professional Doctor Cards */}
                    {msg.role === "bot" && !!msg.doctors?.length && (
                      <div className="mt-2 space-y-3">
                        {msg.doctors.map((doctor, idx) => (
                          <motion.div
                            key={doctor.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.4 + idx * 0.15, // Staggered entrance
                              duration: 0.5,
                              ease: "easeOut",
                            }}
                            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:border-[#1F6F68]/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40"
                          >
                            {/* Subtle background glow on hover */}
                            <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-linear-to-r from-[#1F6F68]/5 to-transparent pointer-events-none" />

                            <div className="relative flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
                                  {/* Profile Image Placeholder or Icon */}
                                  <span className="text-xs font-bold">
                                    {doctor.fullName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">
                                    {doctor.fullName}
                                  </h4>
                                  <p className="text-[12px] text-[#1F6F68] font-medium">
                                    {doctor.specialization || "Consultant"}
                                  </p>
                                </div>
                              </div>

                              <Link
                                href={`/doctors/${doctor.id}`}
                                className="flex h-8 items-center justify-center rounded-lg bg-[#1F6F68] px-4 text-[12px] font-bold text-white transition-transform active:scale-95 hover:bg-[#1a5e58]"
                              >
                                View
                              </Link>
                            </div>

                            <div className="relative mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 dark:border-zinc-800/50">
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-tighter text-zinc-400">
                                  Consultation
                                </span>
                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                  ${doctor.consultationFee}
                                </span>
                              </div>
                              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase tracking-tighter text-zinc-400">
                                  Experience
                                </span>
                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                  {doctor.experienceYears} Years
                                </span>
                              </div>
                              <div className="ml-auto flex items-center gap-1 text-amber-500">
                                <span className="text-[11px] font-bold">
                                  ★ {doctor.rating || "N/A"}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Enhanced Typing Indicator */}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400/80">
                      Assistant
                    </span>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-zinc-100 px-3 py-2.5 w-fit dark:bg-zinc-800">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0,
                        }}
                        className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.2,
                        }}
                        className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.4,
                        }}
                        className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input Area - Fixed height at bottom */}
            <div className="shrink-0 p-4 pt-0">
              <div className="relative flex items-center border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <textarea
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), handleSend())
                  }
                  placeholder="Ask Shifa AI..."
                  disabled={isSending}
                  className="w-full resize-none bg-transparent py-1 text-[14px] outline-none placeholder:text-zinc-400 dark:text-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className={`ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded transition-all ${
                    message.trim() && !isSending
                      ? "bg-[#1F6F68] text-white shadow-sm"
                      : "text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50"
                  }`}
                >
                  <Send size={14} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button className="text-[11px] text-zinc-400 hover:text-[#1F6F68] flex items-center gap-1 transition-colors">
                  <HelpCircle size={12} /> Help Center
                </button>
                <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
                  Enter ↵
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Button */}

      <div className="relative flex items-center gap-3 ">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ delay: 1, duration: 0.4 }}
              /* Theme-colored border and subtle background */
              className="pointer-events-none select-none shadow rounded-lg border border-[#1F6F68]/20 bg-white px-3 py-2  dark:border-[#1F6F68]/30 dark:bg-zinc-900"
            >
              <p className="whitespace-nowrap text-[12px] font-semibold text-[#1F6F68] dark:text-[#2ea097]">
                Get Doctor Suggestions
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles size={12} className="inline ml-1" />
                </motion.span>
              </p>
              {/* Arrow with theme border */}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Persistent Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative cursor-pointer flex h-14 w-14 items-center justify-center rounded-full border shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ${
            isOpen
              ? "bg-white border-zinc-200 text-[#1F6F68] dark:bg-zinc-800 dark:border-zinc-700"
              : "bg-[#1F6F68] border-[#1F6F68] text-white hover:shadow-[0_8px_30px_rgba(31,111,104,0.4)]"
          }`}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative flex items-center justify-center"
              >
                {/* Main Icon */}
                <MessageSquare size={24} />

                {/* Interactive Internal Element (Notion-style Sparkle) */}
                <motion.div
                  animate={{
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles size={14} className="text-amber-300" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
