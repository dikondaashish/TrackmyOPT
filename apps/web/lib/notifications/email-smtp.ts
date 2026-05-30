/**
 * Shared SMTP transporter + send with retry (Resend SMTP, Hostinger, etc.).
 * Used by email-service and transactional-email-queue.
 *
 * SMTP_USER is the SMTP login (e.g. "resend"), NOT the From address.
 * Always use getSmtpFromHeader() for the From header (SMTP_FROM_EMAIL).
 */

import nodemailer from "nodemailer";

/** RFC5322 From header — must be a verified mailbox/domain at your SMTP provider. */
export function getSmtpFromHeader(): string {
  const address =
    process.env.SMTP_FROM_EMAIL?.trim() || "no-reply@trackmyopt.com";
  const name = process.env.EMAIL_FROM_NAME?.trim() || "TrackMyOPT";
  return `${name} <${address}>`;
}

const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  // Port 465 = implicit TLS (secure). Port 587 = STARTTLS (set SMTP_SECURE=false).
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 3,
    maxMessages: 10,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

let transporter: nodemailer.Transporter | null = null;

export const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export async function sendMailWithRetry(
  mailOptions: nodemailer.SendMailOptions,
  maxRetries: number = 3
): Promise<nodemailer.SentMessageInfo> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transport = getTransporter();
      const info = await transport.sendMail(mailOptions);
      return info;
    } catch (error) {
      lastError = error as Error;
      console.error(`Email attempt ${attempt}/${maxRetries} failed:`, (error as Error).message);

      if (
        (error as Error).message?.includes("timeout") ||
        (error as Error).message?.includes("421")
      ) {
        console.log("Recreating transporter due to timeout...");
        if (transporter) {
          transporter.close();
          transporter = null;
        }
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Failed to send email after retries");
}
