"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLinks = () => {
  const pathname = usePathname();
  const normalizePath = (path) => {
    if (!path) return "/";
    return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  };
  const normalizedPathname = normalizePath(pathname || "/");

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/doctors", label: "Doctor" },
    { href: "/nearby-hospitals", label: "Hospitals" },
    { href: "/blogs", label: "Blogs" },
    { href: "/about", label: "About" },
    // { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {navLinks.map((link) => {
        const isActive = normalizedPathname === normalizePath(link.href);
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
