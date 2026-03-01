"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";
import { Autoplay } from "swiper/modules";
import { Virtual } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

const SpecialtiesSwiper = ({ data }) => {
  return (
    <Swiper
      effect={"coverflow"}
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={"auto"}
      coverflowEffect={{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      }}
      spaceBetween={30}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      modules={[Virtual, Autoplay, EffectCoverflow]}
      breakpoints={{
        320: { slidesPerView: 1 },
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      className="mySwiper [&_.swiper-pagination-bullet]:bg-green-600 [&_.swiper-button-next]:text-green-700 [&_.swiper-button-prev]:text-green-700"
    >
      {data.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="border p-6 rounded-xl text-center transition hover:shadow-lg">
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SpecialtiesSwiper;
