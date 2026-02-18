import CTASection from "@/components/Home/CTASection";
import { hindSiliguri } from "../layout";
import BlogSection from "@/components/Home/BlogSection";
import TestimonialsSection from "@/components/Home/TestimonialsSection";
import WhyChooseSection from "@/components/Home/WhyChooseSection";
import SpecialtiesSection from "@/components/Home/SpecialtiesSection";
import DoctorsSection from "@/components/Home/DoctorSection";
import HowItWorks from "@/components/Home/HowItWork";
import ServicesSection from "@/components/Home/ServiceSection";
import Container from "@/components/Navigation/Navbar/Container/Container";
import StatsSection from "@/components/Home/StatesSection";
import FAQ from "@/components/Home/FAQ";

const Home = () => {
  return (
    // <div className=" h-screen  w-full align-middle items-center text-3xl flex justify-center flex-col">
    //   <h1 className=" text-center font-bold ">
    //     Welcome to SHIFA from the developer team!
    //   </h1>
    //   <p
    //     className={`${hindSiliguri.className} text-2xl font-semibold mt-4 text-center`}
    //   >
    //     উন্নত ও সহজলভ্য স্বাস্থ্যসেবার জন্য আপনার নির্ভরযোগ্য টেলিমেডিসিন
    //     প্ল্যাটফর্ম।
    //   </p>
    // </div>
    <>
      <Container>
        <ServicesSection />
        <HowItWorks />
      </Container>
      <StatsSection />
      <Container>
        <DoctorsSection />
        <SpecialtiesSection />
        <WhyChooseSection />
        <TestimonialsSection />
        <BlogSection />
        <CTASection />
        <FAQ />
      </Container>
    </>
  );
};

export default Home;
