"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import ShifaLogoAnimated from "./ShifaLogoAnimated"; // Assumes you save the SVG code as a React Component

export default function ShifaChatbotTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-4">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ delay: 1.5, duration: 0.4 }} // Delay shows it after the logo draws
            className="pointer-events-none select-none rounded-lg border border-[#1F6F68]/20 bg-white px-3 py-2 shadow-sm dark:border-[#1F6F68]/30 dark:bg-zinc-900"
          >
            <p className="whitespace-nowrap text-[12px] font-semibold text-[#1F6F68]">
              Get Doctor Suggestions
              <Sparkles size={12} className="inline ml-1 text-amber-400" />
            </p>
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 rotate-45 h-3 w-3 border-t border-r border-[#1F6F68]/20 bg-white dark:border-[#1F6F68]/30 dark:bg-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Shifa Bot Button */}
      <motion.button
        layout
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-16 w-16 items-center justify-center rounded-full border shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-zinc-100 border-zinc-200 text-[#1F6F68]"
            : "bg-[#1F6F68] border-[#1F6F68] text-white hover:bg-[#1a5e58]"
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
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative flex items-center justify-center p-2"
            >
              {/* THE NEW ANIMATED LOGO COMPONENT */}
              <ShifaLogoAnimated className="h-full w-full" />

              {/* Internal animation on the node linkage */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-x-0 bottom-3 flex justify-center"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#1F6F68]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
