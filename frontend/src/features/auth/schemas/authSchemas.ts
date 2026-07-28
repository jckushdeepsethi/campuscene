import { z } from "zod";

export const userRoleSchema = z.enum(["STUDENT", "SOCIETY", "PLACEMENT_CELL", "ADMIN"]);

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[a-z]/, "Add at least one lowercase letter.")
  .regex(/[0-9]/, "Add at least one number.");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email."),
  password: passwordSchema,
  role: userRoleSchema,
  adminSecretKey: z.string().trim().optional(),
  rollNumber: z.string().trim().optional(),
  branch: z.string().trim().optional(),
  passingYear: z.coerce.number().int().min(2000).max(2100).optional().or(z.literal("")),
  collegeName: z.string().trim().optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

export const tokenSchema = z.object({
  token: z.string().trim().min(32, "Enter a valid token.")
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email.")
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32, "Enter a valid reset token."),
  password: passwordSchema
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type TokenFormValues = z.infer<typeof tokenSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
