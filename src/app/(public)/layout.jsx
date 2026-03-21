import Footer from "@/shared/components/Navigation/Footer/Footer";
import Navbar from "@/shared/components/Navigation/Navbar/Header/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <header>
        <Navbar />
      </header>

      {/* Root layout already applies fonts + Providers */}
      <main className="mt-20">{children}</main>

      <footer>
        <Footer />
      </footer>
    </>
  );
}