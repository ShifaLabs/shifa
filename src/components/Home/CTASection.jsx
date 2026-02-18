import React from "react";

const CTASection = () => {
  return (
    <section className="py-16 text-center">
      <h2 className="text-4xl font-bold mb-4">আজই Shifa এর সাথে যুক্ত হন</h2>

      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        সহজ এবং দ্রুত অনলাইন স্বাস্থ্যসেবা গ্রহণ করুন। অভিজ্ঞ ডাক্তারদের সঙ্গে
        যোগাযোগ করুন এবং আপনার স্বাস্থ্য সম্পর্কিত সমস্যার সমাধান পান, যেকোনো
        সময় এবং যেকোনো জায়গা থেকে।
      </p>

      <div className="flex justify-center gap-6 mb-6 flex-wrap">
        <span className="px-4 py-2 border rounded-lg text-gray-700">
          দ্রুত অ্যাপয়েন্টমেন্ট
        </span>
        <span className="px-4 py-2 border rounded-lg text-gray-700">
          নিরাপদ তথ্য সংরক্ষণ
        </span>
        <span className="px-4 py-2 border rounded-lg text-gray-700">
          অভিজ্ঞ ডাক্তারগণ
        </span>
      </div>

      <button className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition duration-300">
        এখনই নিবন্ধন করুন
      </button>
    </section>
  );
};

export default CTASection;
