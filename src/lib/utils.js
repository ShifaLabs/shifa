import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDoctorProfileImage(profileImage, gender) {
  if (profileImage) {
    return profileImage;
  }

  return gender?.toLowerCase() === "female"
    ? "/female-doctor.png"
    : "/male-doctor.png";
}
