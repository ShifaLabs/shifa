"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, OctagonX, X, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- Refactored SearchInput with K-Hint & Clear Action ---

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative flex-1 group">
      <div
        className={`
        absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200
        ${isFocused ? "text-primary" : "text-muted-foreground"}
      `}
      >
        <Search className="h-5 w-5" />
      </div>

      <Input
        placeholder="Search doctors, specialties, or clinics..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="h-14 pl-12 pr-16 bg-background border-input rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 focus-visible:ring-offset-2 focus-visible:ring-primary text-base"
      />

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange("")}
              className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {!value && (
          <kbd className="hidden md:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>
    </div>
  );
}

// --- Advanced Filter Popover ---

export function AdvancedFilters({
  sort,
  onSortChange,
}: {
  sort: string;
  onSortChange: (v: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-14 px-6 rounded-2xl border-input bg-background shadow-sm hover:shadow-md hover:bg-background flex gap-2"
        >
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {sort !== "recommended" && (
            <Badge
              variant="secondary"
              className="ml-1 rounded-sm px-1 font-normal"
            >
              1
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 rounded-2xl shadow-xl" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold leading-none">Sort By</h4>
            <p className="text-sm text-muted-foreground">
              Adjust the order of results.
            </p>
          </div>
          <div className="grid gap-2">
            {["recommended", "rating", "fee"].map((option) => (
              <Button
                key={option}
                variant={sort === option ? "secondary" : "ghost"}
                className="justify-start capitalize w-full"
                onClick={() => onSortChange(option)}
              >
                {option.replace(/-/g, " ")}
              </Button>
            ))}
          </div>
          <Separator />
          <div className="py-2 text-xs text-muted-foreground italic">
            More filters (Price Range, Availability) coming soon...
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
