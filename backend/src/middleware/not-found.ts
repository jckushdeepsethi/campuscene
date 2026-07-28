import type { RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, ErrorCodes.NOT_FOUND, `Route ${req.method} ${req.originalUrl} not found.`));
};

