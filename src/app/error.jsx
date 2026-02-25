"use client";

import Link from "next/link";

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10 px-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center space-y-6">
        <h1 className="text-5xl font-bold text-primary">Oops!</h1>

        <h2 className="text-2xl font-semibold text-gray-800">
          কিছু একটা সমস্যা হয়েছে
        </h2>

        <p className="text-gray-600">
          দুঃখিত! আপনার অনুরোধটি সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা
          করুন।
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition"
          >
            আবার চেষ্টা করুন
          </button>

          <Link
            href="/"
            className="px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
