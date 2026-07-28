import type { RequestHandler } from "express";
import { UserRole, UserStatus } from "@prisma/client";
import { AppError } from "../errors/app-error.js";
import { ErrorCodes } from "../errors/error-codes.js";
import { toPublicUserDto } from "../dtos/auth.dto.js";
import { UserRepository } from "../repositories/user.repository.js";

const userRepository = new UserRepository();

export class UserController {
  getPendingOrganizers: RequestHandler = async (req, res) => {
    if (!req.auth || req.auth.role !== UserRole.ADMIN) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Only admins can view pending organizer accounts.");
    }

    const organizers = await userRepository.findPendingOrganizers();

    res.status(200).json({
      success: true,
      data: {
        organizers: organizers.map(toPublicUserDto)
      }
    });
  };

  verifyOrganizer: RequestHandler = async (req, res) => {
    if (!req.auth || req.auth.role !== UserRole.ADMIN) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, "Only admins can verify society/club accounts.");
    }

    const userId = req.params.userId as string;
    const { action } = req.body as { action: "APPROVE" | "REJECT" };

    const targetUser = await userRepository.findById(userId);
    if (!targetUser) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, "User account not found.");
    }

    const nextStatus = action === "APPROVE" ? UserStatus.ACTIVE : UserStatus.SUSPENDED;
    const updatedUser = await userRepository.updateStatus(userId, nextStatus);

    res.status(200).json({
      success: true,
      data: {
        user: toPublicUserDto(updatedUser)
      },
      message: action === "APPROVE" ? "Society account verified & activated." : "Society account rejected & suspended."
    });
  };

  updateProfile: RequestHandler = async (req, res) => {
    if (!req.auth) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, "Authentication required.");
    }

    const { name, collegeName, rollNumber, branch, passingYear, interests } = req.body;

    const updatedUser = await userRepository.updateProfile(req.auth.userId, {
      name,
      collegeName,
      rollNumber,
      branch,
      passingYear: passingYear ? Number(passingYear) : undefined,
      interests: Array.isArray(interests) ? interests : undefined
    });

    res.status(200).json({
      success: true,
      data: {
        user: toPublicUserDto(updatedUser)
      },
      message: "Profile updated successfully."
    });
  };
}
