import React from "react";
import Logo from "../Logo/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ScrollEffectWrapper from "./ScrollEffectWrapper/ScrollEffectWrapper";
import MobileMenu from "./MobileMenu/MobileMenu";

const Navbar = () => {
  const links = (
    <>
      <li>
        <Link href={"/"}>Home</Link>
      </li>
      <li>
        <Link href={"/"}>Doctor</Link>
      </li>
      <li>
        <Link href={"/"}>Patient</Link>
      </li>
      <li>
        <Link href={"/"}>Prescription</Link>
      </li>
    </>
  );
  return (
    <ScrollEffectWrapper>
      <div className="xl:px-20 lg:px-16 md:px-10 sm:px-6 px-4 bg-gray-100">
        <div className="flex justify-between items-center py-2">
          {/* left-navbar  */}
          <div className="flex items-center gap-5">
            <Logo />
            <ul className="hidden md:flex gap-4">{links}</ul>
          </div>
          {/* Center-navbar */}
          <div className="md:hidden">
            {/* Mobile menu toggle */}
            <MobileMenu links={links} />
          </div>
          {/* right-navbar  */}
          <div className="flex gap-4">
            <Button variant="outline">Log in</Button>
            <div className="hidden md:flex gap-4">
              <Button>Get started</Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollEffectWrapper>
  );
};

export default Navbar;
