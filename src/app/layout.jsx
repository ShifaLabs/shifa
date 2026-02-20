import { Geist, Geist_Mono, Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata = {
  title: "Shifa - Telemedicine Platform",
  description: "A telemedicine platform for remote healthcare services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          inter.variable,
          hindSiliguri.variable,
          "antialiased",
        ].join(" ")}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}