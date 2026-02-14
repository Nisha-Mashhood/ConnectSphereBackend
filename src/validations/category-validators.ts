import { z } from "zod";
import { nameSchema, objectIdSchema } from "./common-validators";

/** Create */
export const createCategorySchema = z.object({
  name: nameSchema,
});

/**  Update */
export const updateCategorySchema = z.object({
  name: nameSchema,
});

/** Params */
export const categoryIdParamSchema = z.object({
  id: objectIdSchema,
});