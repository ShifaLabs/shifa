/* DoctorFilters.jsx - search, department, sort controls */

export default function DoctorFilters({
  search,
  setSearch,
  department,
  setDepartment,
  sort,
  setSort,
  uniqueDepartments,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10">
      <input
        type="text"
        placeholder="ডাক্তার খুঁজুন..."
        className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-gray-300"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="border px-4 py-2 rounded-lg w-full md:w-64"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
      >
        <option value="">সব বিভাগ</option>
        {uniqueDepartments.map((spec, index) => (
          <option key={index} value={spec}>
            {spec}
          </option>
        ))}
      </select>
      <select
        className="border px-4 py-2 rounded-lg w-full md:w-64"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="recommended">Recommended</option>
        <option value="rating">Top Rated</option>
        <option value="fee">Lowest Fee</option>
      </select>
    </div>
  );
}
