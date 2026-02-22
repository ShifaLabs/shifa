export function resetPasswordTemplate(resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset.</p>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" 
         style="display:inline-block;padding:10px 15px;background:#2563eb;color:white;text-decoration:none;border-radius:5px;">
         Reset Password
      </a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn’t request this, ignore this email.</p>
    </div>
  `;
}
