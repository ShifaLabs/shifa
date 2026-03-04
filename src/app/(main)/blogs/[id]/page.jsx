import Heading from "@/components/Shared/Heading/Heading";
import MotionDiv from "@/components/Shared/MotionDiv/MotionDiv";
import { getBlogById } from "@/features/blogs/blogs";
import React from "react";

const BlogDetails = async ({ params }) => {
  const { id } = await params;
  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500 text-xl">Blog not found!</p>
      </div>
    );
  }
  const blog = await getBlogById(id);
  return (
    <MotionDiv key={id}>
      <div className="container mx-auto px-4 py-8">
        <Heading title={blog.title} />
        <p className="text-gray-500 text-sm mb-4">
          {new Date(blog.createdAt).toLocaleDateString()} • {blog.views} views
        </p>

        <div className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line mb-6">
          {blog.description}
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

export default BlogDetails;
