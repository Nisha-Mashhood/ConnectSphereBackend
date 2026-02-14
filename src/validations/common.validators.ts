import { z } from "zod";

/** Name Validator */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[A-Za-z ]+$/, "Only alphabets and spaces allowed")
  .refine(v => !/\s{2,}/.test(v), {
    message: "Cannot contain multiple consecutive spaces",
  })
  .transform(v => v.trim());

/** Mongo ObjectId Validator */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");