import React from "react";
import Heading from "../Shared/Heading/Heading";
import MotionDiv from "../Shared/MotionDiv/MotionDiv";
import BlogCard from "../blogs/BlogCard";
import { getBlogs } from "@/features/blogs/blogs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BlogSection = async () => {
  const res = await getBlogs({ limit: 3, page: 1 });
  const blogs = res.data || [];

  return (
    <section className="py-16">
      <Heading title="স্বাস্থ্য পরামর্শ ও আর্টিকেল" />

      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <MotionDiv key={index}>
            <div className="h-full">
              <BlogCard blog={blog} />
            </div>
          </MotionDiv>
        ))}
      </div>
      <div className="flex justify-end mt-5">
        <Link
          className="flex justify-center items-center font-semibold text-gray-500"
          href={"/blogs"}
        >
          See more <ArrowRight />
        </Link>
      </div>
    </section>
  );
};

export default BlogSection;
