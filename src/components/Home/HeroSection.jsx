const HeroSection = () => {
  return (
    <section className="py-16">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            আপনার স্বাস্থ্যসেবার বিশ্বস্ত ডিজিটাল সঙ্গী Shifa
          </h1>

          <p className="text-gray-600">
            Shifa এমন একটি টেলিমেডিসিন প্ল্যাটফর্ম যেখানে আপনি ঘরে বসেই দক্ষ
            ডাক্তারদের সাথে যোগাযোগ করতে পারেন। দ্রুত অ্যাপয়েন্টমেন্ট, নিরাপদ
            চিকিৎসা তথ্য সংরক্ষণ এবং সহজ কনসালটেশন সুবিধা প্রদান করা হয়।
          </p>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-black text-white rounded-lg">
              ডাক্তার খুঁজুন
            </button>
            <button className="px-6 py-3 border rounded-lg">
              অ্যাপয়েন্টমেন্ট নিন
            </button>
          </div>
        </div>

        <div>{/* <img src="/hero-health.png" alt="health" /> */}</div>
      </div>
    </section>
  );
};

export default HeroSection;
