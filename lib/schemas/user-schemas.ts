import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-()؀-ۿ]{10,}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  expectedPosition: z.string().max(255).optional().or(z.literal("")),
  totalExperience: z.number().min(0, "Min 0").max(50, "Max 50").optional(),
  careerObjective: z.string().max(500).optional().or(z.literal("")),
  summary: z.string().max(2000).optional().or(z.literal("")),
  certifications: z.string().max(2000).optional().or(z.literal("")),
  education: z.string().max(1000).optional().or(z.literal("")),
  portfolioLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required"),
    newPassword: z.string().min(8, "Min 8 characters"),
    confirmPassword: z.string().min(1, "Required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, "Required"),
  code: z.string().length(6, "Must be 6 digits"),
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type DisableTwoFactorFormValues = z.infer<typeof disableTwoFactorSchema>;

export const deactivateSchema = z.object({
  password: z.string().min(1, "Password is required"),
  reason: z.string().optional().or(z.literal("")),
});

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Password is required"),
    reason: z.string().optional().or(z.literal("")),
    confirmText: z.string().min(1, "This field is required"),
  })
  .refine((d) => d.confirmText === "DELETE", {
    message: 'Type "DELETE" to confirm',
    path: ["confirmText"],
  });

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type DeactivateFormValues = z.infer<typeof deactivateSchema>;
export type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;
