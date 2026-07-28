import { prisma } from "../config/prisma.js";

export class TokenRepository {
  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt }
    });
  }

  findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  }

  revokeRefreshToken(id: string, replacedById?: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: {
        revokedAt: new Date(),
        replacedById
      }
    });
  }

  createEmailVerificationToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt }
    });
  }

  findEmailVerificationToken(tokenHash: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  }

  useEmailVerificationToken(id: string) {
    return prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() }
    });
  }

  createPasswordResetToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt }
    });
  }

  findPasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
  }

  usePasswordResetToken(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() }
    });
  }
}

