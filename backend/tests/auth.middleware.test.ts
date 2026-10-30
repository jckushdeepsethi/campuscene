import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campuscene_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "30";
process.env.BCRYPT_SALT_ROUNDS = "10";

const { authenticate } = await import("../src/middleware/authenticate.js");
const { authorize } = await import("../src/middleware/authorize.js");
const { signAccessToken } = await import("../src/utils/jwt.js");
const { AppError } = await import("../src/errors/app-error.js");

const runMiddleware = (middleware: (req: Request, res: Response, next: NextFunction) => void, req: Partial<Request>) =>
  new Promise<unknown>((resolve) => {
    middleware(req as Request, {} as Response, resolve as NextFunction);
  });

test("authenticate attaches auth context for a valid bearer token", async () => {
  const token = signAccessToken({ sub: "user-1", role: "STUDENT" });
  const req = {
    headers: {
      authorization: `Bearer ${token}`
    }
  } as Partial<Request>;

  const result = await runMiddleware(authenticate, req);

  assert.equal(result, undefined);
  assert.deepEqual((req as Request).auth, { userId: "user-1", role: "STUDENT" });
});

test("authenticate rejects missing bearer tokens", async () => {
  const result = await runMiddleware(authenticate, { headers: {} });

  assert.ok(result instanceof AppError);
  assert.equal(result.statusCode, 401);
});

test("authorize allows matching roles", async () => {
  const result = await runMiddleware(authorize("ADMIN"), {
    auth: {
      userId: "admin-1",
      role: "ADMIN"
    }
  } as Partial<Request>);

  assert.equal(result, undefined);
});

test("authorize rejects non-matching roles", async () => {
  const result = await runMiddleware(authorize("ADMIN"), {
    auth: {
      userId: "student-1",
      role: "STUDENT"
    }
  } as Partial<Request>);

  assert.ok(result instanceof AppError);
  assert.equal(result.statusCode, 403);
});
