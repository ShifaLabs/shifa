import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDoctorProfileImage(
  profileImage?: string | null,
  gender?: string | null,
) {
  const normalizedProfileImage = profileImage?.trim();

  if (normalizedProfileImage) {
    return normalizedProfileImage;
  }

  return gender?.toLowerCase() === "female"
    ? "/female-doctor.png"
    : "/male-doctor.png";
}
