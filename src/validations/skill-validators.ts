import { z } from "zod";
import { nameSchema, objectIdSchema } from "./common-validators";

/** Create */
export const createSkillSchema = z.object({
  name: nameSchema,
  subcategoryId: objectIdSchema,
});

/** Update */
export const updateSkillSchema = z.object({
  name: nameSchema.optional(),
});

/** Params */
export const skillParamSchema = z.object({
  id: objectIdSchema,
});