// lib/auth/auth.config.ts
import { NextAuthOptions } from "next-auth";
import { providers } from "./auth.providers";
import { callbacks } from "./auth.callbacks";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers,

  callbacks,

  pages: {
    signIn: "/register",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
