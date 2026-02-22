import Link from "next/link";

export default function NotFound() {
  return (
    <div className=" h-screen relative flex items-center justify-center bg-linear-to-br from-secondary/20 via-white to-secondary/10 px-6">
      {/* Decorative Background Blur */}
      <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-secondary/30 rounded-full blur-3xl bottom-10 right-10"></div>

      <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-12 max-w-xl w-full text-center space-y-6 border border-primary/20">
        {/* 404 Heading */}
        <h1 className="text-6xl font-bold text-primary">404</h1>

        <h2 className="text-2xl font-semibold text-gray-800">
          পেজটি খুঁজে পাওয়া যায়নি
        </h2>

        <p className="text-gray-600">
          দুঃখিত, আপনি যে পেজটি খুঁজছেন সেটি হয়তো সরানো হয়েছে বা ভুল লিংক
          ব্যবহার করা হয়েছে।
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-primary text-white hover:opacity-90 transition shadow-md"
          >
            হোমে ফিরে যান
          </Link>

          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            সহায়তা নিন
          </Link>
        </div>
      </div>
    </div>
  );
}
