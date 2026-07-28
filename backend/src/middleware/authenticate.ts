import type { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication token is required."));
  }

  try {
    const payload = verifyAccessToken(token);

    if (!Object.values(UserRole).includes(payload.role as UserRole)) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid token role."));
    }

    req.auth = {
      userId: payload.sub,
      role: payload.role as UserRole
    };

    return next();
  } catch {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid or expired token."));
  }
};

