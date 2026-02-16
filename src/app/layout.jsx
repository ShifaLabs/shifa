import { Geist, Geist_Mono, Inter, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navigation/Navbar/Header/Navbar";
import Container from "../components/Navigation/Navbar/Container/Container";
import Footer from "../components/Footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});
const tiroBangla = Tiro_Bangla({
  subsets: ["bengali"],
  weight: ["400"],
  variable: "--font-bangla",
});

export const metadata = {
  title: "Shifa - Telemedicine Platform",
  description: "A telimedicine platform for remote healthcare services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${tiroBangla.variable} antialiased font-sans`}
      >
        <header>
          <Navbar />
        </header>
        <main className="mt-20">
          <Container>{children}</Container>
        </main>
        <Footer></Footer>
      </body>
    </html>
  );
}
