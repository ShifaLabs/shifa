import Logo from "../../Shared/Logo/Logo";
import { Button } from "../../../ui/button";
import Link from "next/link";
import ScrollEffectWrapper from "./ScrollEffectWrapper/ScrollEffectWrapper";
import { getServerSession } from "next-auth";
import MobileNavDrawer from "./MobileMenu/RightDrawer";
import { authOptions } from "@/features/Auth/auth.config";
import UserProfileDropdown from "../../Shared/user-profile-dropdown";
import NavLinks from "./Navlinks/Navlinks";

const Navbar = async () => {
  const session = await getServerSession(authOptions);

  return (
    <ScrollEffectWrapper>
      <div className="xl:px-20 lg:px-16 md:px-10 sm:px-6 px-4">
        <div className="flex justify-between items-center py-1">
          {/* left-navbar  */}
          <div className="flex items-center gap-5">
            <Logo width={60} height={60} text={"text-xl"} />
            <ul className="hidden md:flex gap-4">
              <NavLinks />
            </ul>
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
