import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDoctorProfileImage(profileImage, gender) {
  const normalizedProfileImage = profileImage?.trim();

  if (normalizedProfileImage) {
    return normalizedProfileImage;
  }

  return gender?.toLowerCase() === "female"
    ? "/female-doctor.png"
    : "/male-doctor.png";
}
