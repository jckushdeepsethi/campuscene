import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

export const validateBody =
  <T>(schema: ZodSchema<T>): RequestHandler =>
  (req, _res, next) => {
    req.body = schema.parse(req.body);
    next();
  };

export const validateQuery =
  <T>(schema: ZodSchema<T>): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.parse(req.query);
    Object.defineProperty(req, "query", {
      value: parsed,
      writable: true,
      configurable: true,
      enumerable: true
    });
    next();
  };
