import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { loginWithCredentials } from "./auth.service";

export const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { type: "email" },
      password: { type: "password" },
    },

    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error(JSON.stringify({ code: "INVALID_CREDENTIALS" }));
      }

      const user = await loginWithCredentials(
        credentials.email,
        credentials.password,
      );

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
