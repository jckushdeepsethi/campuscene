import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AuthService } from "../services/auth.service.js";

const authService = new AuthService();

const refreshCookieName = "campusconnect_refresh";

const setRefreshCookie = (res: Parameters<RequestHandler>[1], token: string) => {
  res.cookie(refreshCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth"
  });
};

export class AuthController {
  register: RequestHandler = async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Account created. Verify your email to activate the account.",
      data: result
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
    res.clearCookie(refreshCookieName, { path: "/api/v1/auth" });

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

  forgotPassword: RequestHandler = async (req, res) => {
    const result = await authService.forgotPassword(req.body);

    res.status(200).json({
      success: true,
      message: "If an account exists, a reset email has been sent.",
      data: env.NODE_ENV === "development" ? result : undefined
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
}

