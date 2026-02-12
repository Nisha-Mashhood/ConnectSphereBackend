import { z } from "zod";

export const adminIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid admin ID"),
});

export const limitQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^[0-9]+$/, "Limit must be a number")
    .transform(Number)
    .refine((val) => val > 0, "Limit must be greater than 0")
    .refine((val) => val <= 50, "Limit cannot exceed 50"),
});

export const analyticsQuerySchema = z.object({
  timeFormat: z.enum(["daily", "weekly", "monthly"]),

  days: z
    .string()
    .regex(/^[0-9]+$/, "Days must be a number")
    .transform(Number)
    .refine((val: number) => val > 0, "Days must be positive")
    .refine((val: number) => val <= 365, "Days range too large"),
});

export const updateAdminProfileSchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[A-Za-z ]+$/, "Only alphabets and spaces allowed")
      .refine((v: string) => !/\s{2,}/.test(v), {
        message: "Cannot contain multiple consecutive spaces",
      })
      .refine((v: string) => !/^[^A-Za-z0-9]/.test(v), {
        message: "Cannot start with a special character",
      })
      .refine((v: string) => !/(.)\1{3,}/.test(v), {
        message: "Cannot contain excessive repeated characters",
      }),

    email: z
      .string()
      .email("Invalid email format")
      .max(100, "Email cannot exceed 100 characters")
      .refine((v: string) => !/[A-Z]/.test(v), {
        message: "Email must not contain uppercase letters",
      })
      .refine((v: string) => !/\s{2,}/.test(v), {
        message: "Cannot contain multiple consecutive spaces",
      })
      .refine((v: string) => !/(.)\1{3,}/.test(v), {
        message: "Cannot contain excessive repeated characters",
      })
      .transform((v) => v.toLowerCase().trim()),

    jobTitle: z.string().max(50, "Job Title too long").optional(),
    industry: z.string().max(100, "Industry is too long").optional(),
    reasonForJoining: z
      .string()
      .max(150, "joining reason is too long")
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update",
  );
