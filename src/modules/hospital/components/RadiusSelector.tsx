"use client";

import React from "react";
import { motion } from "framer-motion";
import { Radar, LocateFixed } from "lucide-react";

interface RadiusSelectorProps {
  radius: number;
  setRadius: (radius: number) => void;
}

const options = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "15 km", value: 15000 },
];

export default function RadiusSelector({
  radius,
  setRadius,
}: RadiusSelectorProps) {
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground/80 uppercase tracking-wider">
        <Radar size={16} className="text-primary" />
        <span>Search Radius</span>
      </div>

      <div className="inline-flex h-12 w-full items-center justify-between gap-1 rounded-2xl border border-border/50 bg-secondary/30 p-1.5 backdrop-blur-sm">
        {options.map((option) => {
          const isActive = radius === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setRadius(option.value)}
              className={`relative flex flex-1 items-center justify-center rounded-xl py-2 text-sm font-bold transition-all ${
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {/* Animated Background for active state */}
              {isActive && (
                <motion.div
                  layoutId="active-radius"
                  className="absolute inset-0 z-0 rounded-xl bg-primary shadow-lg shadow-primary/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>

      <p className="px-1 text-[11px] font-medium text-muted-foreground">
        Showing hospitals within a{" "}
        <span className="text-foreground">{(radius / 1000).toFixed(0)}km</span>{" "}
        range of your location.
      </p>
    </div>
  );
}
