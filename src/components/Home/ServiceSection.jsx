import { Stethoscope, CalendarCheck, ShieldCheck, Headset } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <Stethoscope size={32} />,
      title: "অনলাইন ডাক্তার কনসালটেশন",
      desc: "ভিডিও বা লাইভ চ্যাটের মাধ্যমে অভিজ্ঞ ও নিবন্ধিত ডাক্তারদের কাছ থেকে নির্ভরযোগ্য চিকিৎসা পরামর্শ গ্রহণ করুন। দূরবর্তী অবস্থান থেকেও মানসম্মত স্বাস্থ্যসেবা নিশ্চিত করা হয়।",
    },
    {
      icon: <CalendarCheck size={32} />,
      title: "দ্রুত অ্যাপয়েন্টমেন্ট বুকিং",
      desc: "সহজ এবং দ্রুত বুকিং সিস্টেমের মাধ্যমে আপনার প্রয়োজন অনুযায়ী ডাক্তার নির্বাচন করে নির্ধারিত সময়ে অ্যাপয়েন্টমেন্ট নিশ্চিত করুন।",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "নিরাপদ স্বাস্থ্য তথ্য সংরক্ষণ",
      desc: "Shifa প্ল্যাটফর্মে আপনার সকল চিকিৎসা তথ্য উন্নত নিরাপত্তা ব্যবস্থার মাধ্যমে সংরক্ষিত থাকে, যা সম্পূর্ণ গোপনীয়তা নিশ্চিত করে।",
    },
    {
      icon: <Headset size={32} />,
      title: "২৪/৭ স্বাস্থ্য সহায়তা",
      desc: "জরুরি স্বাস্থ্য সমস্যার ক্ষেত্রে দ্রুত সহায়তা পাওয়ার জন্য সার্বক্ষণিক সাপোর্ট সুবিধা প্রদান করা হয়।",
    },
  ];

  return (
    <section className="py-20">
      {/* Section Header */}
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Shifa এর সেবা সমূহ
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Shifa একটি আধুনিক টেলিমেডিসিন প্ল্যাটফর্ম যেখানে রোগীরা সহজে এবং
          নিরাপদভাবে চিকিৎসা সেবা গ্রহণ করতে পারেন।
        </p>
      </div>

      {/* Service Cards */}
      <div className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8`}>
        {services.map((service, index) => (
          <div
            key={index}
            className="group border rounded-2xl p-7 transition duration-300 hover:shadow-xl hover:-translate-y-2"
          >
            {/* Icon */}
            <div className="mb-5 w-fit p-3 rounded-xl bg-gray-100 group-hover:bg-primary/10 transition">
              {service.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition">
              {service.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm">
              {service.desc}
            </p>

            {/* Decorative Line */}
            <div className="w-10 h-[3px] bg-primary mt-6 rounded-full group-hover:w-16 transition-all duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
