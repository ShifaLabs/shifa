import ContactHero from "@/modules/contact/components/ContactHero";
import ContactForm from "@/modules/contact/components/ContactForm";
import ContactInfo from "@/modules/contact/components/ContactInfo";
import ContactFAQ from "@/modules/contact/components/ContactFAQ";
import Container from "@/shared/components/Navigation/Navbar/Container/Container";

export default function ContactPage() {
  return (
    <div className="bg-background text-foreground">
      <ContactHero />

      {/* Main Section */}
      <Container>
        {/* Emergency Notice */}
        <div className="mb-12 rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className={`text-lg font-semibold text-destructive font-bangla`}>
            🚨 জরুরি চিকিৎসার জন্য দয়া করে নিকটস্থ হাসপাতাল বা জরুরি নম্বরে
            যোগাযোগ করুন।
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Shifa telemedicine platform is not for life-threatening emergencies.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          <ContactForm />
          <ContactInfo />
        </div>
      </Container>

      <ContactFAQ />
    </div>
  );
}
