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

    const subject = `Your CampuScene Verification Code: ${token}`;
    const text = `Hello ${name},\n\nYour 6-digit email verification code for CampuScene is:\n\n${token}\n\nEnter this OTP on the verification screen, or click the following link:\n${verificationUrl}\n\nThis verification OTP will expire in 60 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: bold;">CampuScene</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Smart Campus Event & Registration Platform</p>
        </div>
        <h3 style="color: #0f172a; margin-top: 16px;">Welcome to CampuScene, ${name}!</h3>
        <p style="color: #334155; line-height: 1.6;">Thank you for registering. Use the 6-digit verification code below to verify your email address and activate your account:</p>
        
        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #6366f1; border-radius: 12px; padding: 16px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; font-family: monospace;">${token}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Enter this 6-digit OTP code on the verification screen</p>
        </div>

        <div style="margin: 20px 0; text-align: center;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Or Click to Verify Instantly</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code will expire in 60 minutes. If you did not register, please ignore this email.</p>
      </div>
    `;

    const payload: EmailPayload = { to, subject, html, text };
    console.log(`\n======================================================`);
    console.log(`[EmailService] ✉️  Verification OTP for ${to}: ${token}`);
    console.log(`[EmailService] 🔗 Direct Link: ${verificationUrl}`);
    console.log(`======================================================\n`);
    await this.dispatchEmail(payload);
    return payload;
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<EmailPayload> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const subject = `Your CampuScene Password Reset Code: ${token}`;
    const text = `Hello ${name},\n\nYour 6-digit password reset OTP for CampuScene is:\n\n${token}\n\nEnter this OTP on the password reset screen, or click the link below:\n${resetUrl}\n\nThis code will expire in 30 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: bold;">CampuScene</h2>
        </div>
        <h3 style="color: #0f172a;">Password Reset Request</h3>
        <p style="color: #334155; line-height: 1.6;">Hello ${name}, we received a request to reset your password. Use the 6-digit reset code below:</p>
        
        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background-color: #fef2f2; border: 2px dashed #ef4444; border-radius: 12px; padding: 16px 32px;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #b91c1c; font-family: monospace;">${token}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Valid for 30 minutes</p>
        </div>

        <div style="margin: 20px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Or Click to Reset Instantly</a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `;

    const payload: EmailPayload = { to, subject, html, text };
    console.log(`\n======================================================`);
    console.log(`[EmailService] 🔑 Password Reset OTP for ${to}: ${token}`);
    console.log(`[EmailService] 🔗 Direct Link: ${resetUrl}`);
    console.log(`======================================================\n`);
    await this.dispatchEmail(payload);
    return payload;
  }
}
