import { getTransporter } from "./transporter";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const transporter = getTransporter();

  try {
    const info = await transporter.sendMail({
      from: `"Shifa" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (error) {
    console.error("Email error:", error);
    throw new Error("Email sending failed");
  }
}
