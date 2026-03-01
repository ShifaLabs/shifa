import bcrypt from "bcryptjs";

import { AuthError } from "./auth.errors";
import { findUserByEmail, updateUserLoginState } from "@/lib/user.service";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

export async function loginWithCredentials(email: string, password: string) {
  const user = await findUserByEmail(email.toLowerCase());

  if (!user) {
    throw new AuthError({ code: "INVALID_CREDENTIALS" });
  }

  if (!user.password) {
    throw new AuthError({ code: "OAUTH_ACCOUNT" });
  }

  // 🔐 Check lock
  if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
    const remainingMs = new Date(user.lockUntil).getTime() - Date.now();

    const remainingMinutes = Math.ceil(remainingMs / 60000);

    throw new AuthError({
      code: "ACCOUNT_LOCKED",
      remainingMinutes,
    });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const attempts = (user.loginAttempts || 0) + 1;

    const updateData: any = {
      loginAttempts: attempts,
    };

    if (attempts >= MAX_ATTEMPTS) {
      updateData.lockUntil = new Date(Date.now() + LOCK_TIME);
    }

    await updateUserLoginState(user._id, updateData);

    throw new AuthError({
      code: "PASSWORD_INCORRECT",
      remainingAttempts: MAX_ATTEMPTS - attempts,
    });
  }

  // ✅ Success → reset counters
  await updateUserLoginState(user._id, {
    loginAttempts: 0,
    lockUntil: null,
  });

  return user;
}
