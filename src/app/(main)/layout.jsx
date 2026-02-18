import Footer from "../../components/Navigation/Footer/Footer";
import Navbar from "../../components/Navigation/Navbar/Header/Navbar";
import { hindSiliguri } from "../layout";

export default function MainLayout({ children }) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className={`${hindSiliguri.className}`}>{children}</main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}
