"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

interface Props {
  className?: string;
}

export default function ShifaLogoAnimated({ className }: Props) {
  // Animation settings for the drawing effect
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = i * 0.3;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: {
            delay,
            type: "spring" as const,
            duration: 1.5,
            bounce: 0,
          },
          opacity: { delay, duration: 0.01 },
        },
      };
    },
  };

  return (
    <div className={className}>
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        {/* 1. The Leaf - Fades in softly */}
        <motion.path
          d="M125.61,416.71c0,0,131.64-213.31,213.31-282.88c0,0,147.16,93.42,160.52,282.88c0,0-131.64,136.98-282.88,131.64c0,0,43.41,64.12,64.12,122.9"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          fill="#A7D7C5" // Slightly lighter version of your leaf color for better contrast
          className="dark:opacity-80"
        />

        {/* 2. The Heartbeat Line - Draws left to right */}
        <motion.path
          d="M20 280h110l20-80l30 160l25-130l25 100l25-50h120"
          stroke="currentColor" // Uses the text color of the parent button (white)
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw}
          custom={1}
          initial="hidden"
          animate="visible"
        />

        {/* 3. The Top Circle - Draws after line */}
        <motion.circle
          cx="380"
          cy="210"
          r="22"
          stroke="currentColor"
          strokeWidth="16"
          variants={draw}
          custom={2.5}
          initial="hidden"
          animate="visible"
        />

        {/* 4. The Bottom Circle - Draws last */}
        <motion.circle
          cx="380"
          cy="285"
          r="22"
          stroke="currentColor"
          strokeWidth="16"
          variants={draw}
          custom={3}
          initial="hidden"
          animate="visible"
        />

        {/* 5. Internal Connector - Small link inside the leaf */}
        <motion.path
          d="M310 280 L360 280"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          variants={draw}
          custom={2}
          initial="hidden"
          animate="visible"
        />
      </svg>
    </div>
  );
}
