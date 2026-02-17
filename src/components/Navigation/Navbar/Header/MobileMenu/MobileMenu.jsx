"use client";

import { useState } from "react";
import RightDrawer from "./RightDrawer";

const MobileMenu = ({ links, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <RightDrawer user={user} />

      {/* Mobile Links: slide up from bottom */}
      {menuOpen && (
        <ul className="fixed bottom-18 right-3 bg-white/90 backdrop-blur-md shadow-md rounded-md flex flex-col gap-2 p-4 w-50 sm:w-70  z-50 transition-all">
          {links}
        </ul>
      )}
    </div>
  );
};

export default MobileMenu;
