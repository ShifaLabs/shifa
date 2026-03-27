/* DoctorLoading.jsx - loading skeletons */

export default function DoctorLoading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-xl shadow animate-pulse">
          <div className="h-32 w-32 rounded-full bg-gray-200 mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-3" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-200 rounded" />
            <div className="h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
