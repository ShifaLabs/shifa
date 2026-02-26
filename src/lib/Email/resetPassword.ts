export function resetPasswordTemplate(resetUrl: string) {
  const appName = "Shifa";
  const appUrl = "https://shifa-medi.vercel.app/";
  const teamName = "DevToMark";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ${appName}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <tr>
                <td align="center" style="padding: 30px 0; background-color: #2563eb;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">${appName}</h1>
                  <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Your Trusted Telemedicine Partner</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
                  <p style="color: #4b5563; line-height: 1.6;">Hello,</p>
                  <p style="color: #4b5563; line-height: 1.6;">We received a request to reset the password for your <strong>${appName}</strong> account. Click the button below to proceed. This link is valid for <strong>15 minutes</strong>.</p>
                  
                  <table border="0" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center" style="border-radius: 6px;" bgcolor="#2563eb">
                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 30px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold;">Reset Password</a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">If you did not request this change, you can safely ignore this email. Your account remains secure.</p>
                  <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  
                  <p style="color: #9ca3af; font-size: 12px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                  <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${resetUrl}</p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center;">
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                    Built with ❤️ by <strong>${teamName}</strong>
                  </p>
                  
                  <div style="margin-bottom: 20px;">
                    <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">THE DEVELOPMENT TEAM</p>
                    <p style="font-size: 13px; color: #4b5563; margin: 0;">
                      <strong>Sojib Ahmed</strong> (Leader) • Shourov Das • Nazmul Shisir • Tanij Roy
                    </p>
                  </div>

                  <div style="margin-top: 20px;">
                    <a href="${appUrl}" style="color: #2563eb; text-decoration: none; font-size: 14px; margin: 0 10px;">Visit Website</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="#" style="color: #2563eb; text-decoration: none; font-size: 14px; margin: 0 10px;">Facebook</a>
                    <span style="color: #d1d5db;">|</span>
                    <a href="#" style="color: #2563eb; text-decoration: none; font-size: 14px; margin: 0 10px;">LinkedIn</a>
                  </div>

                  <p style="color: #9ca3af; font-size: 12px; margin-top: 25px;">
                    &copy; ${new Date().getFullYear()} Shifa Telemedicine. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
