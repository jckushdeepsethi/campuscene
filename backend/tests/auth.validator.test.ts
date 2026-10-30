import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campuscene_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "30";
process.env.BCRYPT_SALT_ROUNDS = "10";

const { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema } = await import(
  "../src/validators/auth.validator.js"
);

test("registerSchema normalizes email and accepts valid roles", () => {
  const result = registerSchema.parse({
    name: "Kushdeep Sethi",
    email: "  KUSHD@example.com ",
    password: "StrongPass1",
    role: "STUDENT"
  });

  assert.equal(result.email, "kushd@example.com");
  assert.equal(result.role, "STUDENT");
});

test("registerSchema rejects weak passwords", () => {
  assert.equal(registerSchema.safeParse({ name: "Ks", email: "k@example.com", password: "weakpass", role: "STUDENT" }).success, false);
});

test("loginSchema trims and normalizes email", () => {
  const result = loginSchema.parse({
    email: "  KUSHD@example.com ",
    password: "anything"
  });

  assert.equal(result.email, "kushd@example.com");
});

test("token schemas reject short tokens", () => {
  assert.equal(tokenSchema.safeParse({ token: "short" }).success, false);
  assert.equal(resetPasswordSchema.safeParse({ token: "short", password: "StrongPass1" }).success, false);
});

test("forgotPasswordSchema validates email addresses", () => {
  assert.equal(forgotPasswordSchema.safeParse({ email: "not-an-email" }).success, false);
  assert.equal(forgotPasswordSchema.safeParse({ email: "student@example.com" }).success, true);
});
