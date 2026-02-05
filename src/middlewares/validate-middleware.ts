import { ZodError, ZodType } from "zod";
import { Request, Response, NextFunction, RequestHandler } from "express";

export const validate =
  (schema: ZodType<any>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
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
