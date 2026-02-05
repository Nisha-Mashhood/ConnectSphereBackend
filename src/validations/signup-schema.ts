import { z } from "zod";

export const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[A-Za-z ]+$/, "Only alphabets and spaces allowed")
    .refine(v => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine(v => !/^[^A-Za-z0-9]/.test(v), {
      message: "Cannot start with a special character",
    })
    .refine(v => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain excessive repeated characters",
    }),

  email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email cannot exceed 100 characters")
    .refine(v => !/[A-Z]/.test(v), {
      message: "Email must not contain uppercase letters",
    })
    .refine(v => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine(v => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain excessive repeated characters",
    })
    .transform(v => v.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password cannot exceed 20 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
      "Must include uppercase, lowercase, number, and special character"
    )
    .refine(v => !/(\d)\1{2,}/.test(v), {
      message: "Cannot contain sequential repeated digits",
    })
    .refine(v => !/([A-Za-z])\1{2,}/.test(v), {
      message: "Cannot contain sequential repeated letters",
    })
    .refine(v => !/\s{2,}/.test(v), {
      message: "Cannot contain multiple consecutive spaces",
    })
    .refine(v => !/(.)\1{3,}/.test(v), {
      message: "Cannot contain excessive repeated characters",
    })
    .refine(v => !/^[^A-Za-z0-9]/.test(v), {
      message: "Cannot start with a special character",
    }),
});

export type SignupInput = z.infer<typeof signupSchema>;
