import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDoctorProfileImage(
  profileImage?: string | null,
  gender?: string | null,
) {
  if (profileImage) {
    return profileImage;
  }

  return gender?.toLowerCase() === "female"
    ? "/female-doctor.png"
    : "/male-doctor.png";
}
