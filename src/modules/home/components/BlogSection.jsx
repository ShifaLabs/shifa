import React from "react";
import Heading from "@/shared/components/Shared/Heading/Heading";
import MotionDiv from "@/shared/components/Shared/MotionDiv/MotionDiv";

import { getBlogs } from "@/modules/blog/blogs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BlogCard from "@/modules/blog/components/BlogCard";

const BlogSection = async () => {
  let blogs = [];

  try {
    const res = await getBlogs({ limit: 3, page: 1 });
    blogs = res?.data || [];
  } catch (error) {
    console.error("Home blogs fetch failed:", error);
  }

  return (
    <section className="py-16">
      <Heading title="স্বাস্থ্য পরামর্শ ও আর্টিকেল" />

      {blogs.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <MotionDiv key={index}>
              <div className="h-full">
                <BlogCard blog={blog} />
              </div>
            </MotionDiv>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          স্বাস্থ্য নিবন্ধ এখন পাওয়া যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা
          করুন।
        </p>
      )}
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
