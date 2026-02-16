import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navigation/Navbar/Header/Navbar";
import Container from "../components/Navigation/Navbar/Container/Container";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shifa - Telemedicine Platform",
  description: "A telimedicine platform for remote healthcare services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header>
          <Navbar />
        </header>
        <main className="mt-20">
          <Container>{children}</Container>
        </main>
      </body>
    </html>
  );
}
