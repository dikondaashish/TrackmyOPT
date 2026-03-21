/**
 * Shared SMTP transporter + send with retry (Hostinger / env SMTP_*).
 * Used by email-service and transactional-email-queue.
 */

import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: true,
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
