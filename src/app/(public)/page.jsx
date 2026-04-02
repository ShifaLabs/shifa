import CTASection from "@/modules/home/components/CTASection";
import BlogSection from "@/modules/home/components/BlogSection";
import TestimonialsSection from "@/modules/home/components/TestimonialsSection";
import WhyChooseSection from "@/modules/home/components/WhyChooseSection";
import DoctorsSection from "@/modules/home/components/DoctorSection";
import HowItWorks from "@/modules/home/components/HowItWork";
import ServicesSection from "@/modules/home/components/ServiceSection";
import Container from "@/shared/components/Navigation/Navbar/Container/Container";
import StatsSection from "@/modules/home/components/StatesSection";
import FAQ from "@/modules/home/components/FAQ";
import HeroSection from "@/modules/home/components/HeroSection";
import ShifaChatbot from "@/modules/chat/ShifaChatbot";
import SpecialtiesSection from "@/modules/home/components/SpecialtiesSection";

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
