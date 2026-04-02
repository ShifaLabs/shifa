"use client";

import { useEffect, useMemo, useState } from "react";
import { OctagonX } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AdvancedFilters, SearchInput } from "./DoctorSearchInput";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DoctorCard } from "./DoctorCard";
interface DoctorListProps {
  initialData: any[];
}

export default function DoctorListClient({ initialData }: DoctorListProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sort, setSort] = useState("recommended");
  const router = useRouter();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const filteredDoctors = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    let list = [...initialData].filter(
      (d) =>
        d.fullName?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q),
    );

    if (sort === "rating")
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "fee") list.sort((a, b) => (a.fee || 0) - (b.fee || 0));

    return list;
  }, [debouncedQuery, sort, initialData]);

  const handleBook = (id: string) => {
    console.log("Booking doctor:", id);
    // Add your booking logic here (e.g., router.push(`/book/${id}`))
  };

  const handleViewProfile = (id: string) => {
    router.push(`/doctors/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center">
        <SearchInput value={query} onChange={setQuery} />
        <AdvancedFilters sort={sort} onSortChange={setSort} />
      </div>

      <motion.div layout className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredDoctors.map((doc) => (
            <motion.div
              key={doc._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DoctorCard
                doctor={doc}
                onBook={handleBook}
                onViewProfile={handleViewProfile}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredDoctors.length === 0 && (
        <EmptyState onClear={() => setQuery("")} />
      )}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
      <div className="p-4 bg-background rounded-full shadow-sm mb-4">
        <OctagonX className="h-10 w-10 text-destructive/50" />
      </div>
      <h3 className="text-xl font-bold text-foreground">No matches found</h3>
      <p className="text-muted-foreground mt-1 mb-6">
        We couldn&apos;t find any doctors matching your criteria.
      </p>
      <Button onClick={onClear} variant="outline" className="rounded-full">
        Reset Search Filters
      </Button>
    </div>
  );
}
