<<<<<<< HEAD
=======
// DoctorPagination.jsx
>>>>>>> b77432f786a67de1d8c72f5131e1cd9276187995
export default function DoctorPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-gray-200 font-bold" : ""}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}
