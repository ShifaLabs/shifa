// lib/auth/auth.types.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "patient" | "doctor" | "admin";
    profileCompleted?: boolean;
    doctorId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "patient" | "doctor" | "admin";
      profileCompleted?: boolean;
      doctorId?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "patient" | "doctor" | "admin";
    profileCompleted?: boolean;
    doctorId?: string | null;
  }
}
