"use client";
import React, { useState } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const MobileMenu = ({ links }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      {/* Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-2xl focus:outline-none"
      >
        {menuOpen ? <HiX /> : <HiMenu />}
      </button>

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
