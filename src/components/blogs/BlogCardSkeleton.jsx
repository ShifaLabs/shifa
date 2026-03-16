export default function BlogCardSkeleton() {
  return (
    <div className="border p-6 rounded-xl shadow animate-pulse flex flex-col justify-between h-full">
      <div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
    </div>
  );
}
