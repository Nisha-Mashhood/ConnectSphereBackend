import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .refine((v: string) => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine((v: string) => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain excessive repeated characters",
    })
    .transform((v: string) => v.trim()),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password cannot exceed 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Must include uppercase, lowercase, number, and special character"
    )
    .refine((v: string) => !/(\d)\1{2,}/.test(v), {
      message: "Cannot contain sequential repeated digits",
    })
    .refine((v: string) => !/([A-Za-z])\1{2,}/.test(v), {
      message: "Cannot contain sequential repeated letters",
    })
    .refine((v: string) => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine((v: string) => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain excessive repeated characters",
    })
    .refine((v: string) => !/^[^A-Za-z0-9]/.test(v), {
      message: "Cannot start with a special character",
    }),
});

export type LoginInput = z.infer<typeof loginSchema>;
