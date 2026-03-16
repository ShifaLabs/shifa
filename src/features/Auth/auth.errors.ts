export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "PASSWORD_INCORRECT"
  | "ACCOUNT_LOCKED"
  | "OAUTH_ACCOUNT"
  | "EMAIL_NOT_VERIFIED";

export interface AuthErrorPayload {
  code: AuthErrorCode;
  remainingAttempts?: number;
  remainingMinutes?: number;
}

export class AuthError extends Error {
  constructor(public payload: AuthErrorPayload) {
    super(JSON.stringify(payload));
  }
}
