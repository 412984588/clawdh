import nodemailer from "nodemailer";
import { EmailConfig } from "../types.js";

export async function sendEmail(config: EmailConfig, subject: string, body: string): Promise<void> {
  // 复用 SMTP 连接，减少每日任务的握手成本。
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    subject,
    text: body,
  });
}
