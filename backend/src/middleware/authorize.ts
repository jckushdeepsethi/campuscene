import type { UserRole } from "@prisma/client";
import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication is required."));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new AppError(403, ErrorCodes.FORBIDDEN, "You do not have permission to access this resource."));
    }

    return next();
  };

