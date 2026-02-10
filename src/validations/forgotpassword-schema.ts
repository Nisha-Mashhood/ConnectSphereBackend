import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .refine(v => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine(v => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain excessive repeated characters",
    })
    .transform(v => v.trim()),
});

export type forgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
