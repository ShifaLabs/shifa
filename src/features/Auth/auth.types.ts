// lib/auth/auth.types.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "patient" | "doctor";
    profileCompleted?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: "patient" | "doctor";
      profileCompleted?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "patient" | "doctor";
    profileCompleted?: boolean;
  }
}
