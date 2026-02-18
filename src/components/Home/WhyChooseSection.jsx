import React from "react";

const reasons = [
  {
    title: "সহজ ব্যবহারযোগ্য প্ল্যাটফর্ম",
    description:
      "Shifa এর ইন্টারফেস ব্যবহার করা সহজ, তাই যেকোনো বয়সের ব্যবহারকারীর জন্য উপযুক্ত।",
  },
  {
    title: "দক্ষ এবং অভিজ্ঞ ডাক্তার",
    description:
      "নিবন্ধিত এবং অভিজ্ঞ ডাক্তাররা রোগীদের উন্নত ও দায়িত্বশীল চিকিৎসা সেবা প্রদান করেন।",
  },
  {
    title: "দ্রুত সেবা প্রদান",
    description:
      "অ্যাপয়েন্টমেন্ট বুকিং এবং অনলাইন কনসালটেশন দ্রুত এবং সময়মতো সম্পন্ন হয়।",
  },
  {
    title: "নিরাপদ চিকিৎসা তথ্য সংরক্ষণ",
    description:
      "ব্যবহারকারীর স্বাস্থ্য তথ্য সম্পূর্ণ নিরাপদ এবং গোপনীয়ভাবে সংরক্ষিত থাকে।",
  },
  {
    title: "সাশ্রয়ী স্বাস্থ্যসেবা",
    description:
      "Shifa এর মাধ্যমে চিকিৎসা সেবা প্রাপ্তি সহজ এবং অন্যান্য প্রথাগত সেবার তুলনায় সাশ্রয়ী।",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-16">
      <div className="">
        <h2 className="text-4xl font-bold text-center mb-10">
          কেন Shifa নির্বাচন করবেন
        </h2>

        <div className="grid md:grid-cols-5 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="border p-6 rounded-xl text-center transition hover:shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
              <p className="text-gray-600">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
