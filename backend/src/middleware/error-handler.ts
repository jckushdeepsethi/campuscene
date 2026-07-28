import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      code: ErrorCodes.VALIDATION_ERROR,
      message: "Request validation failed.",
      issues: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      code: error.code,
      message: error.message
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    code: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: "Something went wrong."
  });
};

