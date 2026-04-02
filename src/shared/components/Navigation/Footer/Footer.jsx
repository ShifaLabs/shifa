import React from "react";
import Link from "next/link";
import { FaFacebookF, FaLinkedinIn, FaTwitter } from "react-icons/fa";
import Logo from "../Shared/Logo/Logo";

const Footer = () => {
  return (
    <footer className="bg-background py-16 border-t border-border px-16">
      <div>
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo text="text-2xl" />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Secure and appointment-based telemedicine platform connecting
              verified doctors and patients remotely. Your health, our priority.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2 text-lg">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <FaLinkedinIn />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary transition"
              >
                <FaTwitter />
              </Link>
            </div>
          </div>

          {/* Patients */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">For Patients</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/doctors"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Browse Doctors
                </Link>
              </li>
              <li>
                <Link
                  href="/appointments"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  href="/prescriptions"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  View Prescriptions
                </Link>
              </li>
              <li>
                <Link
                  href="/medical-history"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Medical Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Doctors */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">For Doctors</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/apply-doctor"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Join as Doctor
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Doctor Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/availability"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Set Availability
                </Link>
              </li>
              <li>
                <Link
                  href="/earnings"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Earnings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition"
                >
                  Contact Us
                </Link>
              </li>
            </ul>

            <p className="text-xs text-muted-foreground mt-4">
              ⚠ This platform does not provide emergency medical services.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Shifa. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Secure • Scalable • Appointment-Based Architecture
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
