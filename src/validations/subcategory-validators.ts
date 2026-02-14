import { z } from "zod";
import { nameSchema, objectIdSchema } from "./common-validators";

/** Create */
export const createSubcategorySchema = z.object({
  name: nameSchema,
  categoryId: objectIdSchema,
  description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(300, "Description too long"),
});

/** Update */
export const updateSubcategorySchema = z.object({
  name: nameSchema.optional(),
  description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(300, "Description too long"),
});

/** Params */
export const subcategoryParamSchema = z.object({
  id: objectIdSchema,
});

export const categoryParamSchema = z.object({
  categoryId: objectIdSchema,
});