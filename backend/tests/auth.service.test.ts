import assert from "node:assert/strict";
import test from "node:test";
import bcrypt from "bcrypt";
import type { User, UserRole, UserStatus } from "@prisma/client";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/campusconnect_test";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-with-at-least-thirty-two-characters";
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "30";
process.env.BCRYPT_SALT_ROUNDS = "10";

const { AuthService } = await import("../src/services/auth.service.js");
const { AppError } = await import("../src/errors/app-error.js");
const { hashToken } = await import("../src/utils/crypto.js");

const createUser = (overrides: Partial<User> = {}): User => ({
  id: "user-1",
  name: "Kushdeep Sethi",
  email: "kushdeep@example.com",
  passwordHash: "hash",
  role: "STUDENT" as UserRole,
  status: "PENDING_VERIFICATION" as UserStatus,
  emailVerifiedAt: null,
  createdAt: new Date("2026-07-27T00:00:00.000Z"),
  updatedAt: new Date("2026-07-27T00:00:00.000Z"),
  ...overrides
});

const createService = async () => {
  const users = new Map<string, User>();
  const refreshTokens = new Map<string, any>();
  const emailTokens = new Map<string, any>();
  const resetTokens = new Map<string, any>();
  const calls = {
    revokedRefreshToken: null as null | { id: string; replacedById?: string },
    usedEmailToken: null as null | string,
    usedResetToken: null as null | string,
    updatedPasswordHash: null as null | string
  };

  const userRepository = {
    async findByEmail(email: string) {
      return [...users.values()].find((user) => user.email === email) ?? null;
    },
    async findById(id: string) {
      return users.get(id) ?? null;
    },
    async create(data: { name: string; email: string; passwordHash: string; role: UserRole }) {
      const user = createUser({ id: `user-${users.size + 1}`, ...data });
      users.set(user.id, user);
      return user;
    },
    async markEmailVerified(userId: string) {
      const user = users.get(userId)!;
      const updatedUser = createUser({
        ...user,
        status: "ACTIVE" as UserStatus,
        emailVerifiedAt: new Date("2026-07-27T01:00:00.000Z")
      });
      users.set(userId, updatedUser);
      return updatedUser;
    },
    async updatePassword(userId: string, passwordHash: string) {
      calls.updatedPasswordHash = passwordHash;
      const user = users.get(userId)!;
      const updatedUser = createUser({ ...user, passwordHash });
      users.set(userId, updatedUser);
      return updatedUser;
    }
  };

  const tokenRepository = {
    async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
      const record = {
        id: `refresh-${refreshTokens.size + 1}`,
        userId,
        tokenHash,
        expiresAt,
        revokedAt: null,
        replacedById: null,
        createdAt: new Date(),
        user: users.get(userId)!
      };
      refreshTokens.set(tokenHash, record);
      return record;
    },
    async findRefreshToken(tokenHash: string) {
      return refreshTokens.get(tokenHash) ?? null;
    },
    async revokeRefreshToken(id: string, replacedById?: string) {
      calls.revokedRefreshToken = { id, replacedById };
      const record = [...refreshTokens.values()].find((token) => token.id === id);
      if (record) {
        record.revokedAt = new Date();
        record.replacedById = replacedById;
      }
      return record;
    },
    async createEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date) {
      const record = { id: `email-${emailTokens.size + 1}`, userId, tokenHash, expiresAt, usedAt: null, createdAt: new Date() };
      emailTokens.set(tokenHash, record);
      return record;
    },
    async findEmailVerificationToken(tokenHash: string) {
      const record = emailTokens.get(tokenHash);
      return record ? { ...record, user: users.get(record.userId)! } : null;
    },
    async useEmailVerificationToken(id: string) {
      calls.usedEmailToken = id;
      return { id };
    },
    async createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
      const record = { id: `reset-${resetTokens.size + 1}`, userId, tokenHash, expiresAt, usedAt: null, createdAt: new Date() };
      resetTokens.set(tokenHash, record);
      return record;
    },
    async findPasswordResetToken(tokenHash: string) {
      const record = resetTokens.get(tokenHash);
      return record ? { ...record, user: users.get(record.userId)! } : null;
    },
    async usePasswordResetToken(id: string) {
      calls.usedResetToken = id;
      return { id };
    }
  };

  return {
    service: new AuthService({
      userRepository: userRepository as never,
      tokenRepository: tokenRepository as never
    }),
    users,
    refreshTokens,
    emailTokens,
    resetTokens,
    calls
  };
};

test("register creates a user and stores a hashed verification token", async () => {
  const { service, emailTokens } = await createService();

  const result = await service.register({
    name: "Kushdeep Sethi",
    email: "kushdeep@example.com",
    password: "StrongPass1",
    role: "STUDENT"
  });

  assert.equal(result.user.email, "kushdeep@example.com");
  assert.equal(result.user.status, "PENDING_VERIFICATION");
  assert.equal(result.verificationToken.length > 32, true);
  assert.equal(emailTokens.has(hashToken(result.verificationToken)), true);
  assert.equal(emailTokens.has(result.verificationToken), false);
});

test("register rejects duplicate email addresses", async () => {
  const { service, users } = await createService();
  users.set("user-1", createUser());

  await assert.rejects(
    () =>
      service.register({
        name: "Kushdeep Sethi",
        email: "kushdeep@example.com",
        password: "StrongPass1",
        role: "STUDENT"
      }),
    (error) => error instanceof AppError && error.statusCode === 409
  );
});

test("login validates credentials and creates a refresh token", async () => {
  const { service, users, refreshTokens } = await createService();
  users.set("user-1", createUser({ passwordHash: await bcrypt.hash("StrongPass1", 10), status: "ACTIVE" as UserStatus }));

  const result = await service.login({
    email: "kushdeep@example.com",
    password: "StrongPass1"
  });

  assert.equal(typeof result.accessToken, "string");
  assert.equal(typeof result.refreshToken, "string");
  assert.equal(result.expiresIn, "15m");
  assert.equal(refreshTokens.has(hashToken(result.refreshToken)), true);
});

test("login rejects suspended users", async () => {
  const { service, users } = await createService();
  users.set("user-1", createUser({ passwordHash: await bcrypt.hash("StrongPass1", 10), status: "SUSPENDED" as UserStatus }));

  await assert.rejects(
    () => service.login({ email: "kushdeep@example.com", password: "StrongPass1" }),
    (error) => error instanceof AppError && error.statusCode === 403
  );
});

test("refresh rotates a valid refresh token and revokes the previous token", async () => {
  const { service, users, refreshTokens, calls } = await createService();
  users.set("user-1", createUser({ status: "ACTIVE" as UserStatus }));
  const existingRefreshToken = "existing-refresh-token-with-enough-length";
  refreshTokens.set(hashToken(existingRefreshToken), {
    id: "refresh-1",
    userId: "user-1",
    tokenHash: hashToken(existingRefreshToken),
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    replacedById: null,
    createdAt: new Date(),
    user: users.get("user-1")!
  });

  const result = await service.refresh(existingRefreshToken);

  assert.equal(typeof result.accessToken, "string");
  assert.equal(typeof result.refreshToken, "string");
  assert.equal(calls.revokedRefreshToken?.id, "refresh-1");
  assert.equal(calls.revokedRefreshToken?.replacedById, "refresh-2");
});

test("verifyEmail consumes a valid token and activates the user", async () => {
  const { service, users, emailTokens, calls } = await createService();
  users.set("user-1", createUser());
  const verificationToken = "valid-verification-token-with-enough-length";
  emailTokens.set(hashToken(verificationToken), {
    id: "email-1",
    userId: "user-1",
    tokenHash: hashToken(verificationToken),
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    createdAt: new Date()
  });

  const user = await service.verifyEmail(verificationToken);

  assert.equal(calls.usedEmailToken, "email-1");
  assert.equal(user.status, "ACTIVE");
  assert.ok(user.emailVerifiedAt);
});

test("resetPassword hashes the new password and marks the token as used", async () => {
  const { service, users, resetTokens, calls } = await createService();
  users.set("user-1", createUser());
  const resetToken = "valid-reset-token-with-enough-length";
  resetTokens.set(hashToken(resetToken), {
    id: "reset-1",
    userId: "user-1",
    tokenHash: hashToken(resetToken),
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    createdAt: new Date()
  });

  await service.resetPassword({
    token: resetToken,
    password: "NewStrongPass1"
  });

  assert.equal(calls.usedResetToken, "reset-1");
  assert.ok(calls.updatedPasswordHash);
  assert.equal(await bcrypt.compare("NewStrongPass1", calls.updatedPasswordHash!), true);
});
