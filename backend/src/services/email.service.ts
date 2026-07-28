import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      });
    }
  }

  private async dispatchEmail(payload: EmailPayload): Promise<void> {
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: env.EMAIL_FROM,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html
        });
        console.log(`[EmailService] Real email dispatched successfully to ${payload.to}`);
      } catch (err) {
        console.error(`[EmailService Error] Failed to send email to ${payload.to}:`, err);
      }
    } else {
      console.log(`[EmailService Dev Log] Email dispatched to ${payload.to}:`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Body Link / Text: ${payload.text}`);
    }
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<EmailPayload> {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

    const subject = "Verify your account on TheScene";
    const text = `Hello ${name},\n\nPlease verify your account on TheScene by clicking the following link:\n${verificationUrl}\n\nThis token will expire in 60 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: bold;">TheScene AI</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">What's the scene on campus?</p>
        </div>
        <h3 style="color: #0f172a;">Welcome to TheScene, ${name}!</h3>
        <p style="color: #334155; line-height: 1.6;">Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="${verificationUrl}" style="color: #4f46e5;">${verificationUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This verification link will expire in 60 minutes.</p>
      </div>
    `;

    const payload: EmailPayload = { to, subject, html, text };
    await this.dispatchEmail(payload);
    return payload;
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<EmailPayload> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const subject = "Reset your CampusConnect Password";
    const text = `Hello ${name},\n\nYou requested a password reset for your CampusConnect account. Click the link below to set a new password:\n${resetUrl}\n\nThis token will expire in 30 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">CampusConnect</h2>
        </div>
        <h3 style="color: #0f172a;">Password Reset Request</h3>
        <p style="color: #334155; line-height: 1.6;">Hello ${name}, we received a request to reset your password. Click the button below to set a new password:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #4f46e5;">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This password reset link will expire in 30 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    const payload: EmailPayload = { to, subject, html, text };
    await this.dispatchEmail(payload);
    return payload;
  }
}
