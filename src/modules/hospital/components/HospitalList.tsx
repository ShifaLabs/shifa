"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, ChevronRight } from "lucide-react";
import type { NearbyHospitalWithDistance } from "../utils/types";

interface HospitalListProps {
  hospitals: NearbyHospitalWithDistance[];
}

export default function HospitalList({ hospitals }: HospitalListProps) {
  if (!hospitals || hospitals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
        <MapPin className="h-10 w-10 opacity-20 mb-2" />
        <p>No nearby hospitals found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      {hospitals.map((h, index) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              {/* Distance Badge */}
              <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                <Navigation className="h-3 w-3 fill-current" />
                {h.distanceKm.toFixed(1)} km away
              </div>

              {/* Hospital Name */}
              <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {h.name}
              </h3>

              {/* Coordinates / Address Placeholder */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Lat: {h.lat.toFixed(3)}, Lng: {h.lng.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`,
                  "_blank",
                )
              }
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-all hover:bg-primary hover:text-white"
              aria-label="Get Directions"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Subtle Progress Bar (Design Element) */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary/50">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(10, 100 - h.distanceKm * 10)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
