"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

interface UserProfileProps {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
}

const UserProfile = ({ name, image, size = "md" }: UserProfileProps) => {
  const [imageError, setImageError] = useState(false);
  const safeName = typeof name === "string" ? name.trim() : "";

  // Size mapping for scalability
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-16 w-16 text-base",
    xl: "h-24 w-24 text-xl",
  };

  // Get Initials (e.g., "John Doe" -> "JD")
  const initials =
    safeName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  // Generate a consistent "Joss" background color based on the name
  const getBackgroundColor = (str: string) => {
    const source = str || "user";
    const colors = [
      "bg-emerald-500",
      "bg-[#1F6F68]",
      "bg-blue-600",
      "bg-indigo-600",
      "bg-violet-600",
      "bg-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < source.length; i++) {
      hash = source.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-inner ${sizes[size]}`}
    >
      {image && !imageError ? (
        <Image
          src={image}
          alt={safeName || "User profile"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
          priority={size === "xl"} // High priority for large profiles
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-bold text-primary bg-background ${getBackgroundColor(safeName)}`}
        >
          <div className="absolute inset-0 bg-black/10 transition-opacity hover:opacity-0" />
          {safeName ? initials : <User className="h-1/2 w-1/2" />}
        </div>
      )}

      {/* Modern High-End Overlay Ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
    </div>
  );
};

export default UserProfile;
