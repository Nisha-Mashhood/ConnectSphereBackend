import { ZodError, ZodTypeAny } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: ZodTypeAny, target: ValidationTarget = "body"): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse(req[target]);

      req[target] = result;

      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            details: err.issues.map(issue => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        });
        return;
      }

      next(err);
    }
  };
