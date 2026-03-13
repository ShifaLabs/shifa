// lib/auth/auth.callbacks.ts
import { findUserByEmail, createOAuthUser } from "../../lib/user.service";

export const callbacks = {
  async jwt({ token, user }: any) {
    // First login
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.profileCompleted = user.profileCompleted;
      token.doctorId = user.doctorId || null;
      token.name = user.name || user.fullName || token.name;
      token.picture = user.image || user.profileImage || token.picture;
      return token;
    }

    if (!token.email) return token;

    const dbUser = await findUserByEmail(token.email.toLowerCase());

    if (!dbUser) return token;

    token.id = dbUser._id.toString();
    token.role = dbUser.role;
    token.profileCompleted = dbUser.profileCompleted;
    token.doctorId = dbUser.doctorId?.toString?.() || null;
    token.name = dbUser.fullName || token.name;
    token.picture = dbUser.profileImage || token.picture;

    return token;
  },

  async session({ session, token }: any) {
    if (session.user && token) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.profileCompleted = token.profileCompleted;
      session.user.doctorId = token.doctorId;
      session.user.name = token.name || session.user.name;
      session.user.image = token.picture || session.user.image;
    }

    return session;
  },

  async signIn({ account, user }: any) {
    if (account?.provider !== "google") return true;
    if (!user.email) return false;

    const email = user.email.toLowerCase();
    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      await createOAuthUser({
        fullName: user.name,
        email,
        profileImage: user.image,
        role: "patient",
        provider: "google",
      });
    } else {
      // Prevent provider conflict
      if (existingUser.provider !== "google") {
        throw new Error(
          "This email is already registered using email/password login.",
        );
      }
    }

    return true;
  },
};
