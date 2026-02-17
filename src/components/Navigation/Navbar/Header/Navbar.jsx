import React from "react";
import Logo from "../Logo/Logo";
import { Button } from "../../../ui/button";
import Link from "next/link";
import ScrollEffectWrapper from "./ScrollEffectWrapper/ScrollEffectWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import UserProfileDropdown from "../../Shared/user-profile-dropdown";
import MobileNavDrawer from "./MobileMenu/RightDrawer";

const Navbar = async () => {
  const session = await getServerSession(authOptions);
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
      <div className="xl:px-20 lg:px-16 md:px-10 sm:px-6 px-4">
        <div className="flex justify-between items-center py-1">
          {/* left-navbar  */}
          <div className="flex items-center gap-5">
            <Logo width={60} height={60} text={"text-xl"} />
            <ul className="hidden md:flex gap-4">{links}</ul>
          </div>
          {/* Center-navbar */}
          <div className="md:hidden">
            <MobileNavDrawer user={session?.user} />
          </div>
          {/* right-navbar  */}
          {session?.user?.role ? (
            <div className="hidden md:flex gap-4">
              <UserProfileDropdown user={session.user} />
            </div>
          ) : (
            <div className="hidden md:flex gap-4">
              <Button variant="outline">
                <Link href={"/login"}>Log in</Link>
              </Button>
              <div className="hidden md:flex gap-4">
                <Button>Get started</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollEffectWrapper>
  );
};

export default Navbar;
