// Zod validation schemas for all auth forms
import { z } from "zod";

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, "Required"),
  password: z.string().min(8, "At least 8 characters"),
});

// Base candidate fields (without .refine so .extend() works on it)
const candidateBaseSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/\d/, "Must contain a digit"),
  confirmPassword: z.string(),
  fullName: z.string().min(3, "At least 3 characters"),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-()\u0600-\u06FF]{10,}$/, "Invalid phone number"),
});

export const candidateRegisterSchema = candidateBaseSchema.refine(
  (d) => d.password === d.confirmPassword,
  { message: "Passwords must match", path: ["confirmPassword"] },
);

export const hrRegisterSchema = candidateBaseSchema
  .extend({
    department: z.string().min(1, "Required"),
    hrManagerEmail: z.string().email("Invalid email"),
    address: z.string().min(1, "Required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const hrManagerRegisterSchema = candidateBaseSchema
  .extend({
    department: z.string().min(1, "Required"),
    address: z.string().min(1, "Required"),
    companyName: z.string().min(1, "Required"),
    companyAddress: z.string().min(1, "Required"),
    companyNo: z.string().optional(),
    companyWebsite: z.string().url("Invalid URL").optional().or(z.literal("")),
    companyDescription: z.string().optional(),
    companySize: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/\d/, "Must contain a digit"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type CandidateRegisterFormValues = z.infer<
  typeof candidateRegisterSchema
>;
export type HrRegisterFormValues = z.infer<typeof hrRegisterSchema>;
export type HrManagerRegisterFormValues = z.infer<
  typeof hrManagerRegisterSchema
>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
