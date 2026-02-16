import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link href={"/"}>
      <Image
        src="/shifa_logo.png"
        alt="Logo"
        loading="eager"
        width={60}
        height={60}
      />
    </Link>
  );
};

export default Logo;
