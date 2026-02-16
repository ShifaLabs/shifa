import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = ({ width, height, text }) => {
  return (
<<<<<<< HEAD
    <Link href={"/"}>
      <Image
        src="/shifa_logo.png"
        alt="Logo"
        loading="eager"
        width={60}
        height={60}
      />
=======
    <Link href={"/"} className="flex justify-center items-center gap-2">
      <Image src="/shifa_logo.png" alt="Logo" width={width} height={height} />
      <p className={`font-bold ${text}`}>SHIFA</p>
>>>>>>> 7b073399e3104923ba8d01a9f69db56c3ff4c33f
    </Link>
  );
};

export default Logo;
