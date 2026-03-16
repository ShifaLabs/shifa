"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  MoreHorizontal,
  HelpCircle,
} from "lucide-react";

export default function ShifaChatbot() {
  const [status, setStatus] = useState("loading");
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([
    {
      role: "bot",
      content: "Hi. I'm the Shifa Assistant. How can I help you today?",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setHistory([...history, { role: "user", content: message }]);
    setMessage("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "I have skin rash and itching",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("AI Response:", data);
      setStatus("done");
    } catch (error) {
      console.error("AI request failed:", error);
      setStatus("error");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end sm:bottom-6 sm:right-6">
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
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
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
              className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
            >
              {history.map((msg, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {msg.role === "bot" ? "Assistant" : "You"}
                  </span>
                  <div
                    className={`text-[14px] leading-relaxed ${
                      msg.role === "user"
                        ? "text-zinc-900 dark:text-white font-medium"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
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
                  className="w-full resize-none bg-transparent py-1 text-[14px] outline-none placeholder:text-zinc-400 dark:text-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className={`ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded transition-all ${
                    message.trim()
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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-all duration-200 ${
          isOpen
            ? "bg-white border-zinc-200 text-[#1F6F68] dark:bg-zinc-800 dark:border-zinc-700"
            : "bg-[#1F6F68] border-[#1F6F68] text-white hover:bg-[#1a5e58]"
        }`}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </motion.button>
    </div>
  );
}
