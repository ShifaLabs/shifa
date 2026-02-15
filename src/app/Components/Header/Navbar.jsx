import React from "react";
import Container from "../Container/Container";
import Logo from "../Logo/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ScrollEffectWrapper from "./ScrollEffectWrapper/ScrollEffectWrapper";

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
          <div className="left-navbar flex items-center gap-5">
            <Logo />
            <ul className="hidden md:flex gap-4">{links}</ul>
          </div>
          <div className="right-navbar flex gap-4">
            <Button variant="outline">Log in</Button>
            <Button>Get started</Button>
          </div>
        </div>
      </div>
    </ScrollEffectWrapper>
  );
};

export default Navbar;
