// lib/auth/auth.providers.ts
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "../user.service";

export const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { type: "email" },
      password: { type: "password" },
    },

    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      const email = credentials.email.toLowerCase();
      const user = await findUserByEmail(email);

      if (!user) {
        throw new Error("No account found with this email");
      }

      if (!user.password) {
        throw new Error(
          "This account was created using Google. Please sign in with Google.",
        );
      }

      const isValid = await bcrypt.compare(credentials.password, user.password);

      if (!isValid) {
        throw new Error("Incorrect password");
      }

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role,
        profileCompleted: user.profileCompleted,
      };
    },
  }),

  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];
