import BlogCardSkeleton from "@/components/blogs/BlogCardSkeleton";
import Heading from "@/components/Shared/Heading/Heading";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Heading title={"স্বাস্থ্য ব্লগ"} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <BlogCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}
