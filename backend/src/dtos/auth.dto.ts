import type { User, UserRole, UserStatus } from "@prisma/client";

export type PublicUserDto = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  rollNumber?: string | null;
  branch?: string | null;
  passingYear?: number | null;
  collegeName?: string | null;
  interests: string[];
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

export const toPublicUserDto = (user: User): PublicUserDto => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  rollNumber: user.rollNumber,
  branch: user.branch,
  passingYear: user.passingYear,
  collegeName: user.collegeName,
  interests: user.interests ?? [],
  emailVerifiedAt: user.emailVerifiedAt,
  createdAt: user.createdAt
});
