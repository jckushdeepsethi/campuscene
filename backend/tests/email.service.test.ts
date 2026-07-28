import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campusconnect_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";

const { EmailService } = await import("../src/services/email.service.js");

test("sendVerificationEmail renders HTML and text payloads containing verification URL", async () => {
  const service = new EmailService();
  const payload = await service.sendVerificationEmail("alice@example.com", "Alice Smith", "token-12345678901234567890123456789012");

  assert.equal(payload.to, "alice@example.com");
  assert.ok(/Verify your account on TheScene|Verify your CampusConnect Account/i.test(payload.subject));
  assert.ok(payload.html.includes("http://localhost:5173/verify-email?token=token-12345678901234567890123456789012"));
  assert.ok(payload.text.includes("http://localhost:5173/verify-email?token=token-12345678901234567890123456789012"));
});

test("sendPasswordResetEmail renders HTML and text payloads containing reset URL", async () => {
  const service = new EmailService();
  const payload = await service.sendPasswordResetEmail("alice@example.com", "Alice Smith", "token-12345678901234567890123456789012");

  assert.equal(payload.to, "alice@example.com");
  assert.ok(payload.subject.includes("Reset your CampusConnect Password"));
  assert.ok(payload.html.includes("http://localhost:5173/reset-password?token=token-12345678901234567890123456789012"));
  assert.ok(payload.text.includes("http://localhost:5173/reset-password?token=token-12345678901234567890123456789012"));
});
