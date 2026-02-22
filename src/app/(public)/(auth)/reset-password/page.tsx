"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <p className="text-red-500 text-center">
          Invalid or missing password reset token.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <ResetPasswordForm token={token} />
    </main>
  );
}
