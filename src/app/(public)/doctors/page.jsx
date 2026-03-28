"use client";
import { useMemo, useState } from "react";

import DoctorList from "@/modules/doctor/components/DoctorList";
import DoctorFilters from "@/modules/doctor/components/DoctorFilters";
import DoctorPagination from "@/modules/doctor/components/DoctorPagination";
import DoctorLoading from "@/modules/doctor/components/DoctorLoading";
import DoctorError from "@/modules/doctor/components/DoctorError";
import { useDoctors } from "@/infrastructure/hooks/useDoctors";

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("__all__");
  const [sort, setSort] = useState("recommended");

  const { doctors, totalPages, loading, error } = useDoctors({
    page,
    limit,
    department: department === "__all__" ? "" : department,
  });

  // memoized derived state
  const processedDoctors = useMemo(() => {
    let result = [...doctors];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d?.fullName?.toLowerCase().includes(q));
    }

    if (sort === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (sort === "fee") {
      result.sort((a, b) => (a.fee || 0) - (b.fee || 0));
    }

    return result;
  }, [doctors, search, sort]);

  const departments = useMemo(
    () => [
      ...new Set(
        doctors.map((d) => d.specialization).filter((v) => !!v && v !== ""),
      ),
    ],
    [doctors],
  );

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <Header />

        <DoctorFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
          sort={sort}
          setSort={setSort}
          uniqueDepartments={departments}
        />

        {error && <DoctorError message={error} />}

        {loading ? (
          <DoctorLoading />
        ) : (
          <>
            <DoctorList doctors={processedDoctors} />
            <DoctorPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="text-center mb-5">
      <h1 className="text-3xl font-semibold text-gray-900">
        আমাদের অভিজ্ঞ ডাক্তারগণ
      </h1>
    </div>
  );
}
