import { z } from "zod";

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required")
    .min(8, "Current password must be at least 8 characters")
    .max(20, "Current password cannot exceed 20 characters"),

  newPassword: z
    .string()
    .min(1, "New password is required")
    .min(8, "New password must be at least 8 characters long")
    .max(20, "New password cannot exceed 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "New password must include uppercase, lowercase, number, and special character"
    )
    .refine((v) => !/(\d)\1{2,}/.test(v), {
      message: "Cannot contain sequential repeated digits",
    })
    .refine((v) => !/([A-Za-z])\1{2,}/.test(v), {
      message: "Cannot contain sequential repeated letters",
    })
    .refine((v) => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine((v) => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain a character repeated more than 3 times in a row",
    })
    .refine((v) => !/^[^A-Za-z0-9]/.test(v), {
      message: "Cannot start with a special character",
    }),

  confirmPassword: z.string().optional(),
}).refine(
  (data) => data.newPassword !== data.currentPassword,
  {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }
).refine(
  (data) => !data.confirmPassword || data.newPassword === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;