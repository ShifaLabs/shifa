"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLinks = () => {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Doctor" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {navLinks.map((link) => {
        const isActive = pathname === link.href;

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`transition-colors ${
                isActive
                  ? "text-primary font-semibold border-b-2"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </>
  );
};

export default NavLinks;
