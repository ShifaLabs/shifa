import BlogCard from "@/components/blogs/BlogCard";
import Heading from "@/components/Shared/Heading/Heading";
import MotionDiv from "@/components/Shared/MotionDiv/MotionDiv";
import { getBlogs } from "@/features/blogs/blogs";

export const revalidate = 10; // ISR (optional)

export default async function BlogsPage() {
  const blog = await getBlogs();
  const blogs = blog.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Heading title={"স্বাস্থ্য ব্লগ"} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <MotionDiv key={blog._id}>
            <div className="h-full">
              <BlogCard blog={blog} />
            </div>
          </MotionDiv>
        ))}
      </div>
    </div>
  );
}
