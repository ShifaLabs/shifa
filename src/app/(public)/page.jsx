import CTASection from "@/components/Home/CTASection";
import BlogSection from "@/components/Home/BlogSection";
import TestimonialsSection from "@/components/Home/TestimonialsSection";
import WhyChooseSection from "@/components/Home/WhyChooseSection";
import DoctorsSection from "@/components/Home/DoctorSection";
import HowItWorks from "@/components/Home/HowItWork";
import ServicesSection from "@/components/Home/ServiceSection";
import Container from "@/components/Navigation/Navbar/Container/Container";
import StatsSection from "@/components/Home/StatesSection";
import FAQ from "@/components/Home/FAQ";
import HeroSection from "@/components/Home/HeroSection";
import ShifaChatbot from "@/features/ai/ShifaChatbot";
import SpecialtiesSection from "@/components/Home/SpecialtiesSection";

const Home = () => {
  return (
    <>
      <HeroSection />
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
      <ShifaChatbot />
      {/* <ShifaChatbotTrigger /> */}
    </>
  );
};

export default Home;
