import Footer from "../../components/Navigation/Footer/Footer";
import Navbar from "../../components/Navigation/Navbar/Header/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>{children}</main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}
