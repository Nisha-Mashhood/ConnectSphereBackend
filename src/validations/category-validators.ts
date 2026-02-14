import { z } from "zod";
import { nameSchema, objectIdSchema } from "./common-validators";

/** Create */
export const createCategorySchema = z.object({
  name: nameSchema,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description too long"),
});

/**  Update */
export const updateCategorySchema = z.object({
  name: nameSchema,
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description too long"),
});

/** Params */
export const categoryIdParamSchema = z.object({
  id: objectIdSchema,
});