import nodemailer from "nodemailer";

/**
 * Configure SMTP transporter using environment variables.
 * Compatible with Gmail, Brevo, Mailgun, Amazon SES, or custom SMTP.
 *
 * For free Gmail sending:
 * SMTP_HOST="smtp.gmail.com"
 * SMTP_PORT="465"
 * SMTP_SECURE="true"
 * SMTP_USER="your-email@gmail.com"
 * SMTP_PASS="your-16-digit-google-app-password"
 */
function getTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || (host.includes("gmail") ? 465 : 587);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Generate a modern, branded HTML email template for verification codes.
 */
function getVerificationEmailHtml(otp, recipientEmail) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ElectroVault Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .wrapper {
      max-width: 580px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0b1329 0%, #1e293b 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-decoration: none;
      display: inline-block;
      margin-bottom: 8px;
    }
    .logo span {
      color: #3b82f6;
    }
    .header-sub {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
    }
    .content {
      padding: 36px 32px;
      text-align: center;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .description {
      font-size: 15px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .otp-container {
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 20px 24px;
      display: inline-block;
      margin-bottom: 24px;
    }
    .otp-code {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #0284c7;
      margin: 0;
    }
    .expiry {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 28px;
    }
    .security-note {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 14px 16px;
      border-radius: 6px;
      text-align: left;
      font-size: 13px;
      color: #92400e;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
    .footer a {
      color: #64748b;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Electro<span>Vault</span></div>
      <p class="header-sub">Certified Refurbished & Brand-New Electronics</p>
    </div>
    
    <div class="content">
      <div class="title">Verify Your Email Address</div>
      <p class="description">
        Use the 6-digit verification code below to complete your login or registration on ElectroVault for <strong>${recipientEmail}</strong>.
      </p>

      <div class="otp-container">
        <div class="otp-code">${otp}</div>
      </div>

      <div class="expiry">
        ⏱️ This code will expire in <strong>10 minutes</strong>.
      </div>

      <div class="security-note">
        <strong>Security Notice:</strong> Never share this code with anyone. ElectroVault support staff will never ask for your verification code.
      </div>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} ElectroVault UK. All rights reserved.<br />
      If you did not request this verification code, please ignore this email safely.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send 6-digit verification OTP code to an email address.
 * If SMTP credentials are not configured, logs to console and returns demo fallback.
 */
export async function sendVerificationEmail({ email, otp }) {
  try {
    const transporter = getTransporter();

    // Demo Mode Fallback if SMTP is not yet configured
    if (!transporter) {
      console.log(`\n======================================================`);
      console.log(`📧 [EMAIL OTP SIMULATION] (No SMTP credentials configured)`);
      console.log(`To: ${email}`);
      console.log(`Code: ${otp}`);
      console.log(`Tip: Add SMTP_USER and SMTP_PASS in .env.local for real inbox delivery.`);
      console.log(`======================================================\n`);

      return {
        success: true,
        sent: false,
        demoMode: true,
        otp,
      };
    }

    const fromAddress =
      process.env.SMTP_FROM ||
      `"ElectroVault UK" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: `Your ElectroVault Verification Code: ${otp}`,
      text: `Your ElectroVault verification code is ${otp}. It will expire in 10 minutes. Please do not share this code with anyone.`,
      html: getVerificationEmailHtml(otp, email),
    });

    console.log(`📧 [EMAIL OTP DELIVERED] Message ID: ${info.messageId} to ${email}`);

    return {
      success: true,
      sent: true,
      demoMode: false,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ [EMAIL OTP ERROR] Failed to send email via SMTP:", error);
    // Don't crash the user flow if SMTP fails; fallback to allowing verification
    return {
      success: false,
      sent: false,
      demoMode: true,
      error: error.message,
      otp,
    };
  }
}
