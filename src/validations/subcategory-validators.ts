import { z } from "zod";
import { nameSchema, objectIdSchema } from "./common-validators";

/** Create */
export const createSubcategorySchema = z.object({
  name: nameSchema,
  categoryId: objectIdSchema,
});

/** Update */
export const updateSubcategorySchema = z.object({
  name: nameSchema.optional(),
});

/** Params */
export const subcategoryParamSchema = z.object({
  id: objectIdSchema,
});

export const categoryParamSchema = z.object({
  categoryId: objectIdSchema,
});