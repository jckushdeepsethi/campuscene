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

const { addDays, addMinutes, createOpaqueToken, hashToken } = await import("../src/utils/crypto.js");
const { signAccessToken, verifyAccessToken } = await import("../src/utils/jwt.js");

test("createOpaqueToken returns high-entropy URL-safe tokens", () => {
  const firstToken = createOpaqueToken();
  const secondToken = createOpaqueToken();

  assert.notEqual(firstToken, secondToken);
  assert.equal(firstToken.length > 32, true);
  assert.match(firstToken, /^[A-Za-z0-9_-]+$/);
});

test("hashToken is deterministic and does not expose the original token", () => {
  const token = "opaque-token-value";
  const hash = hashToken(token);

  assert.equal(hash, hashToken(token));
  assert.notEqual(hash, token);
  assert.equal(hash.length, 64);
});

test("date helpers add minutes and days without mutating the original date", () => {
  const date = new Date("2026-07-27T00:00:00.000Z");

  assert.equal(addMinutes(date, 30).toISOString(), "2026-07-27T00:30:00.000Z");
  assert.equal(addDays(date, 2).toISOString(), "2026-07-29T00:00:00.000Z");
  assert.equal(date.toISOString(), "2026-07-27T00:00:00.000Z");
});

test("access tokens can be signed and verified", () => {
  const token = signAccessToken({ sub: "user-1", role: "STUDENT" });
  const payload = verifyAccessToken(token);

  assert.equal(payload.sub, "user-1");
  assert.equal(payload.role, "STUDENT");
});
