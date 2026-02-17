import Footer from "../../components/Navigation/Footer/Footer";
import Container from "../../components/Navigation/Navbar/Container/Container";
import Navbar from "../../components/Navigation/Navbar/Header/Navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <Container>{children}</Container>
      <Footer></Footer>
    </>
  );
}
