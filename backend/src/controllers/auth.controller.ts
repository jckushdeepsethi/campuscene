import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

const refreshCookieName = "campuscene_refresh";

const setRefreshCookie = (res: Parameters<RequestHandler>[1], token: string) => {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    secure: env.NODE_ENV === "production",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth"
  });
};

export class AuthController {
  register: RequestHandler = async (req, res) => {
    const result = await authService.register(req.body);
    const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

    res.status(201).json({
      success: true,
      message: hasSmtp
        ? "Account created. Verify your email with the OTP code sent to your inbox."
        : "Account created. (SMTP is not configured on this server, code provided below).",
      data: {
        ...result,
        smtpConfigured: hasSmtp
      }
    });
  };

  login: RequestHandler = async (req, res) => {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }
    });
  };

  refreshToken: RequestHandler = async (req, res) => {
    const result = await authService.refresh(req.cookies[refreshCookieName]);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      }
    });
  };

  logout: RequestHandler = async (req, res) => {
    await authService.logout(req.cookies[refreshCookieName]);
    res.clearCookie(refreshCookieName, {
      path: "/api/v1/auth",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      secure: env.NODE_ENV === "production"
    });

    res.status(204).send();
  };

  verifyEmail: RequestHandler = async (req, res) => {
    const user = await authService.verifyEmail(req.body.token);

    res.status(200).json({
      success: true,
      message: "Email verified.",
      data: { user }
    });
  };

  resendVerification: RequestHandler = async (req, res) => {
    const result = await authService.resendVerification(req.body.email);
    const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

    res.status(200).json({
      success: true,
      message: hasSmtp
        ? "If an unverified account exists, a verification code has been dispatched to your email."
        : "Verification code generated. (SMTP is not configured on this server, code provided below).",
      data: !hasSmtp || env.NODE_ENV === "development" ? { ...result, smtpConfigured: hasSmtp } : undefined
    });
  };

  forgotPassword: RequestHandler = async (req, res) => {
    const result = await authService.forgotPassword(req.body);
    const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

    res.status(200).json({
      success: true,
      message: hasSmtp
        ? "If an account exists, a reset code has been sent to your email."
        : "Reset code generated. (SMTP is not configured on this server, code provided below).",
      data: !hasSmtp || env.NODE_ENV === "development" ? { ...result, smtpConfigured: hasSmtp } : undefined
    });
  };

  resetPassword: RequestHandler = async (req, res) => {
    await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: "Password reset successfully."
    });
  };

  me: RequestHandler = async (req, res) => {
    const user = await authService.getMe(req.auth!.userId);

    res.status(200).json({
      success: true,
      data: { user }
    });
  };

  getPendingOrganizers: RequestHandler = async (_req, res) => {
    const organizers = await authService.getPendingOrganizers();
    res.status(200).json({
      success: true,
      data: organizers
    });
  };

  updateOrganizerStatus: RequestHandler = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;
    const updated = await authService.updateOrganizerStatus(id, status);
    res.status(200).json({
      success: true,
      data: updated
    });
  };
}

