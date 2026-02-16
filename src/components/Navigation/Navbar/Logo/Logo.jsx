import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = ({ width, height, text }) => {
  return (
    <Link href={"/"} className="flex justify-center items-center gap-2">
      <Image src="/shifa_logo.png" alt="Logo" width={width} height={height} />
      <p className={`font-bold ${text}`}>SHIFA</p>
    </Link>
  );
};

export default Logo;
