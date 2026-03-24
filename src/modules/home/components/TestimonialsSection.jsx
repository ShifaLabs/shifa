import React from "react";
import Heading from "@/shared/components/Shared/Heading/Heading";
import MotionDiv from "@/shared/components/Shared/MotionDiv/MotionDiv";

const testimonials = [
  {
    name: "আশিকা রহমান",
    role: "ব্যবহারকারী",
    feedback:
      "Shifa ব্যবহার করে আমি খুব সহজে অনলাইনে চিকিৎসা নিতে পেরেছি। পুরো প্রক্রিয়াটি দ্রুত এবং নির্ভরযোগ্য ছিল।",
  },
  {
    name: "সুমন চক্রবর্তী",
    role: "ব্যবহারকারী",
    feedback:
      "ডাক্তার নির্বাচন এবং অ্যাপয়েন্টমেন্ট বুক করা অত্যন্ত সহজ। অভিজ্ঞ ডাক্তাররা দ্রুত সেবা প্রদান করেছেন।",
  },
  {
    name: "ফাতেমা খাতুন",
    role: "ব্যবহারকারী",
    feedback:
      "আমার সন্তানকে শিশু বিশেষজ্ঞের কাছে অনলাইনে দেখানো সম্ভব হয়েছে। প্রক্রিয়াটি খুব smooth এবং user-friendly।",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16">
      <Heading title="ব্যবহারকারীদের অভিজ্ঞতা" />
      <div className="grid md:grid-cols-3 gap-2">
        {testimonials.map((testimonial, index) => (
          <MotionDiv
            key={index}
            className="p-6 border rounded-xl shadow hover:shadow-lg transition duration-300"
          >
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-gray-500 border">
              {testimonial.name.split(" ")[0][0]}
            </div>
            <p className="text-gray-600 mb-4">{testimonial.feedback}</p>
            <h3 className="text-lg font-semibold">{testimonial.name}</h3>
            <p className="text-gray-500 text-sm">{testimonial.role}</p>
          </MotionDiv>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
