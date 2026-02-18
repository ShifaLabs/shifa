import React from "react";

const blogs = [
  {
    title: "স্বাস্থ্য সচেতনতা বিষয়ক নির্দেশনা",
    description:
      "প্রতি দিন স্বাস্থ্য সচেতন থাকলে বিভিন্ন রোগ প্রতিরোধ করা সম্ভব। নিয়মিত ব্যায়াম, সুষম খাদ্য ও পর্যাপ্ত ঘুম অপরিহার্য।",
    link: "#",
  },
  {
    title: "রোগ প্রতিরোধের কার্যকর উপায়",
    description:
      "হাইজিন মেনে চলা, ভ্যাকসিন গ্রহণ এবং নিয়মিত স্বাস্থ্য পরীক্ষা রোগ প্রতিরোধে সাহায্য করে। স্বাস্থ্যকর অভ্যাস দৈনন্দিন জীবনকে সুস্থ রাখে।",
    link: "#",
  },
  {
    title: "সুস্থ জীবনযাত্রার পরামর্শ",
    description:
      "মানসিক এবং শারীরিক সুস্থতার জন্য ব্যায়াম, মেডিটেশন, স্বাস্থ্যকর খাদ্য এবং পর্যাপ্ত বিশ্রাম গুরুত্বপূর্ণ। ছোট ছোট অভ্যাস বড় প্রভাব ফেলে।",
    link: "#",
  },
];

const BlogSection = () => {
  return (
    <section className="py-16">
      <h2 className="text-4xl font-bold text-center mb-12">
        স্বাস্থ্য পরামর্শ ও আর্টিকেল
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <div
            key={index}
            className="border p-6 rounded-xl shadow hover:shadow-lg transition duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
            <p className="text-gray-600 mb-4">{blog.description}</p>
            <a
              href={blog.link}
              className="text-blue-600 font-semibold hover:underline"
            >
              আরও পড়ুন
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
