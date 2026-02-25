"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const banners = [
  {
    title: "যেকোনো সময়, যেকোনো স্থানে ডাক্তারদের পরামর্শ নিন",
    description:
      "নিরাপদ ভিডিও কনসালটেশনের মাধ্যমে যাচাই করা পেশাদারদের কাছ থেকে বিশেষজ্ঞ পরামর্শ পান।",
    rightTitle: "২৪/৭ স্বাস্থ্যসেবা",
    rightDesc:
      "কোনো অ্যাপয়েন্টমেন্ট ছাড়াই কয়েক মিনিটে সনদপ্রাপ্ত ডাক্তারদের সাথে কথা বলুন।",
    image: "https://i.ibb.co.com/wFJBSvmH/Medicine-bro.png",
  },
  {
    title: "আমাদের বিশ্বস্ত চিকিৎসা দলের সাথে পরিচিত হোন",
    description:
      "অভিজ্ঞ এবং লাইসেন্সপ্রাপ্ত ডাক্তাররা ব্যক্তিগত যত্ন প্রদানে প্রস্তুত।",
    rightTitle: "পেশাদার ও সহানুভূতিশীল",
    rightDesc:
      "নিরাপদ ও নির্ভরযোগ্য পরামর্শ। আপনার স্বাস্থ্য আমাদের অগ্রাধিকার।",
    image:
      "https://i.ibb.co.com/zVnyg6f9/Doctors-bro.pnghttps://i.ibb.co.com/xtsTCBv0/Webinar-bro.png",
  },
  {
    title: "দ্রুত ও নিরাপদ অনলাইন পরামর্শ",
    description:
      "যেকোনো স্থানে মুহূর্তের মধ্যে স্বাস্থ্য বিশেষজ্ঞদের সাথে সংযোগ করুন।",
    rightTitle: "নিরাপদ ও গোপনীয়",
    rightDesc: "আপনার তথ্য উন্নত নিরাপত্তা ব্যবস্থার মাধ্যমে সুরক্ষিত।",
    image: "https://i.ibb.co.com/xtsTCBv0/Webinar-bro.png",
  },
];

const HeroSection = () => {
  return (
    <section className="w-full">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 2000 }}
        effect="fade"
        loop={true}
        className="w-full"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={index}>
            <div className="w-full min-h-[60vh] bg-linear-to-br from-blue-50 via-white to-emerald-50 flex items-center px-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 w-full">
                {/* Left Content */}
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-gray-900">
                    {banner.title}
                  </h1>

                  <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
                    {banner.description}
                  </p>

                  <Button size="lg" className="px-8 py-6 text-lg shadow-md">
                    Book Consultation
                  </Button>
                </div>

                {/* Center Image */}
                <div className="flex-1 flex justify-center">
                  <Image
                    src={banner.image}
                    alt="Telemedicine Banner"
                    width={450}
                    height={380}
                    className="object-contain"
                  />
                </div>

                {/* Right Content */}
                <div className="flex-1 space-y-4 text-center md:text-right">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {banner.rightTitle}
                  </h3>

                  <p className="text-gray-600 max-w-sm mx-auto md:ml-auto">
                    {banner.rightDesc}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSection;
