import { UserRole } from "@prisma/client";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase(),
  password: passwordSchema,
  role: z.nativeEnum(UserRole),
  adminSecretKey: z.string().trim().optional(),
  rollNumber: z.string().trim().max(50).optional(),
  branch: z.string().trim().max(100).optional(),
  passingYear: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || val === 0 || Number.isNaN(Number(val)) ? undefined : Number(val)),
    z.number().int().min(2000).max(2100).optional()
  ),
  collegeName: z.string().trim().max(200).optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1)
});

export const tokenSchema = z.object({
  token: z.string().min(32)
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: passwordSchema
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
