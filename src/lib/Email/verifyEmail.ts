export default function verifyEmailTemplates({ otp }: { otp: string }) {
  const appName = "Shifa";
  const appUrl = "https://shifa-medi.vercel.app/";
  const teamName = "DevToMark";
  const year = new Date().getFullYear();

  // Hardcoded HEX values from your Shifa Medical Theme
  const theme = {
    primary: "#1F6F68", // Your --primary (Deep Medical Teal)
    primaryForeground: "#F4F9F8", // Your --primary-foreground (Off-white mint)
    secondary: "#9FD6B2", // Your --secondary (Soft Leaf Green)
    background: "#F0F7F6", // Your --background (Very light mint tint)
    textMain: "#1A2D2C", // Your --foreground (Deep charcoal teal)
    textMuted: "#6B8381", // Your --muted-foreground
    border: "#DDE8E7", // Your --border
    card: "#FFFFFF", // Your --card
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ${appName}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${theme.background}; font-family: 'Inter', -apple-system, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${theme.card}; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
              
              <tr>
                <td align="center" style="padding: 40px 0; background-color: ${theme.primary};">
                  <div style="background-color: rgba(255,255,255,0.1); display: inline-block; padding: 12px 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);">
                     <h1 style="color: ${theme.primaryForeground}; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">${appName}</h1>
                  </div>
                  <p style="color: ${theme.secondary}; margin: 10px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">Account Verification</p>
                </td>
              </tr>

              <tr>
                <td style="padding: 45px 35px;">
                  <h2 style="color: ${theme.textMain}; margin: 0 0 15px 0; font-size: 22px; font-weight: 700;">Confirm Your Email Address</h2>
                  <p style="color: ${theme.textMuted}; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Thank you for joining <strong>${appName}</strong>. To complete your registration and secure your health profile, please use the verification code below:
                  </p>
                  
                  <div style="background-color: ${theme.background}; border: 2px dashed ${theme.secondary}; padding: 30px; border-radius: 16px; text-align: center; margin: 30px 0;">
                    <span style="display: block; color: ${theme.textMuted}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Your Verification Code</span>
                    <span style="color: ${theme.primary}; font-size: 42px; font-weight: 800; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                  </div>

                  <p style="color: ${theme.textMuted}; font-size: 14px; text-align: center; margin-bottom: 30px;">
                    This code will expire in <strong>10 minutes</strong>.
                  </p>

                  <div style="background-color: #f4f9f8; border-left: 4px solid ${theme.primary}; padding: 20px; border-radius: 8px; margin-bottom: 35px;">
                    <p style="color: ${theme.primary}; font-size: 14px; font-weight: 700; margin: 0 0 8px 0;">🛡️ Secure Registration</p>
                    <ul style="color: ${theme.textMuted}; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
                      <li>If you didn't create an account, please ignore this email.</li>
                      <li>Never share this code with anyone, including Shifa staff.</li>
                    </ul>
                  </div>
                  
                  <hr style="border: 0; border-top: 1px solid ${theme.border}; margin: 35px 0;">
                  
                  <p style="color: ${theme.textMuted}; font-size: 11px; line-height: 1.5; text-align: center;">
                    Problems with the code? Visit our <a href="${appUrl}" style="color: ${theme.primary}; text-decoration: none;">Help Center</a> or try requesting a new one from the app.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #F9FBFB; padding: 40px 35px; border-top: 1px solid ${theme.border}; text-align: center;">
                  <p style="color: ${theme.textMain}; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Developed by ${teamName}</p>
                  <p style="color: ${theme.textMuted}; font-size: 11px; margin-bottom: 20px;">
                    Sojib Ahmed • Shourov Das • Nazmul Shisir • Tanij Roy
                  </p>

                  <div style="margin-bottom: 25px;">
                    <a href="${appUrl}" style="color: ${theme.primary}; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 10px;">Visit SHIFA</a>
                    <span style="color: ${theme.border};">&bull;</span>
                    <a href="#" style="color: ${theme.primary}; text-decoration: none; font-size: 12px; font-weight: 600; margin: 0 10px;">Privacy Policy</a>
                  </div>

                  <p style="color: #94a3b8; font-size: 10px; line-height: 1.4; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                    &copy; ${year} SHIFA Telemedicine. All Rights Reserved.<br>
                    Encrypted Medical-Grade Communication.
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
