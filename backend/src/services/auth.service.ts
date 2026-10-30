import bcrypt from "bcrypt";
import { UserStatus } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";
import { toPublicUserDto } from "../dtos/auth.dto.js";
import { TokenRepository } from "../repositories/token.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import { EmailService } from "./email.service.js";
import type { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "../validators/auth.validator.js";
import { addDays, addMinutes, createOpaqueToken, hashToken } from "../utils/crypto.js";
import { signAccessToken } from "../utils/jwt.js";

type AuthServiceDependencies = {
  userRepository?: UserRepository;
  tokenRepository?: TokenRepository;
  emailService?: EmailService;
};

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly tokenRepository: TokenRepository;
  private readonly emailService: EmailService;

  constructor(dependencies: AuthServiceDependencies = {}) {
    this.userRepository = dependencies.userRepository ?? new UserRepository();
    this.tokenRepository = dependencies.tokenRepository ?? new TokenRepository();
    this.emailService = dependencies.emailService ?? new EmailService();
  }

  async register(input: RegisterInput) {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, ErrorCodes.CONFLICT, "An account with this email already exists.");
    }

    if (input.role === "ADMIN") {
      if (!input.adminSecretKey || input.adminSecretKey !== env.ADMIN_SECRET_KEY) {
        throw new AppError(403, ErrorCodes.FORBIDDEN, "Invalid Admin Security Key. Admin accounts can only be created by authorized system owners.");
      }
    }

    if (input.role === "SOCIETY" || input.role === "PLACEMENT_CELL") {
      const existingSociety = await this.userRepository.findExistingSociety(input.name, input.collegeName);
      if (existingSociety) {
        throw new AppError(
          409,
          ErrorCodes.CONFLICT,
          `A society/club account for "${input.name}" already exists${input.collegeName ? ` at ${input.collegeName}` : ""}. Only one official account per society is permitted.`
        );
      }
    }

    const initialStatus = (input.role === "SOCIETY" || input.role === "PLACEMENT_CELL")
      ? UserStatus.PENDING_VERIFICATION
      : UserStatus.PENDING_VERIFICATION;

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: initialStatus,
      rollNumber: input.rollNumber,
      branch: input.branch,
      passingYear: input.passingYear,
      collegeName: input.collegeName
    });

    const verificationToken = createOpaqueToken();
    await this.tokenRepository.createEmailVerificationToken(user.id, hashToken(verificationToken), addMinutes(new Date(), 60));
    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return {
      user: toPublicUserDto(user),
      verificationToken
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid email or password.");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "This account has been suspended.");
    }

    return this.issueTokenPair(user.id, user.role);
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.tokenRepository.findRefreshToken(hashToken(refreshToken));

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Invalid refresh token.");
    }

    const nextTokenPair = await this.issueTokenPair(storedToken.user.id, storedToken.user.role);
    const nextTokenRecord = await this.tokenRepository.findRefreshToken(hashToken(nextTokenPair.refreshToken));

    await this.tokenRepository.revokeRefreshToken(storedToken.id, nextTokenRecord?.id);

    return nextTokenPair;
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    const storedToken = await this.tokenRepository.findRefreshToken(hashToken(refreshToken));

    if (storedToken && !storedToken.revokedAt) {
      await this.tokenRepository.revokeRefreshToken(storedToken.id);
    }
  }

  async verifyEmail(token: string) {
    const storedToken = await this.tokenRepository.findEmailVerificationToken(hashToken(token));

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Invalid or expired verification token.");
    }

    await this.tokenRepository.useEmailVerificationToken(storedToken.id);
    const user = await this.userRepository.markEmailVerified(storedToken.userId);

    return toPublicUserDto(user);
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return { resetToken: null };
    }

    const resetToken = createOpaqueToken();
    await this.tokenRepository.createPasswordResetToken(user.id, hashToken(resetToken), addMinutes(new Date(), 30));
    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return { resetToken };
  }

  async resetPassword(input: ResetPasswordInput) {
    const storedToken = await this.tokenRepository.findPasswordResetToken(hashToken(input.token));

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, "Invalid or expired reset token.");
    }

    const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
    await this.userRepository.updatePassword(storedToken.userId, passwordHash);
    await this.tokenRepository.usePasswordResetToken(storedToken.id);
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found.");
    }

    return toPublicUserDto(user);
  }

  async getPendingOrganizers() {
    const organizers = await this.userRepository.findPendingOrganizers();
    return organizers.map(toPublicUserDto);
  }

  async updateOrganizerStatus(userId: string, status: UserStatus) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User not found.");
    }
    const updated = await this.userRepository.updateStatus(userId, status);
    return toPublicUserDto(updated);
  }

  private async issueTokenPair(userId: string, role: string) {
    const accessToken = signAccessToken({ sub: userId, role });
    const refreshToken = createOpaqueToken();

    await this.tokenRepository.createRefreshToken(
      userId,
      hashToken(refreshToken),
      addDays(new Date(), env.REFRESH_TOKEN_TTL_DAYS)
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: env.ACCESS_TOKEN_TTL
    };
  }
}
