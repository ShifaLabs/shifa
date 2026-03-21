export type EmailVerification = {
  _id: string;
  userId: string;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
};
