"use client";
import { useEffect, useState } from "react";

export function useDoctors({ page, limit, department }) {
  const [data, setData] = useState({
    doctors: [],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDoctors() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(department && { specialization: department }),
        });

        const res = await fetch(`/api/doctors?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();

        setData({
          doctors: json?.data || [],
          total: json?.pagination?.total || 0,
          totalPages: json?.pagination?.totalPages || 1,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("ডাক্তার লোড করা যাচ্ছে না");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();

    return () => controller.abort(); // 🔥 important cleanup
  }, [page, limit, department]);

  return { ...data, loading, error };
}
