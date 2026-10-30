import type { Prisma, User, UserStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  findExistingSociety(name: string, collegeName?: string) {
    return prisma.user.findFirst({
      where: {
        role: { in: ["SOCIETY", "PLACEMENT_CELL"] },
        name: { equals: name, mode: "insensitive" },
        ...(collegeName && { collegeName: { equals: collegeName, mode: "insensitive" } })
      }
    });
  }

  findPendingOrganizers() {
    return prisma.user.findMany({
      where: {
        role: { in: ["SOCIETY", "PLACEMENT_CELL"] },
        status: "PENDING_VERIFICATION"
      },
      orderBy: { createdAt: "desc" }
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  markEmailVerified(userId: string, status: UserStatus = "ACTIVE") {
    return prisma.user.update({
      where: { id: userId },
      data: {
        status,
        emailVerifiedAt: new Date()
      }
    });
  }

  updateStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  }

  updateProfile(
    userId: string,
    data: {
      name?: string;
      collegeName?: string;
      rollNumber?: string;
      branch?: string;
      passingYear?: number;
      interests?: string[];
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }
}
