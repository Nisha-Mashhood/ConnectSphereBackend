import "express";
import { Multer } from "multer";

declare module "express-serve-static-core" {
  interface Request {
    files?: {
      [fieldname: string]: Multer.File[];
    };
  }
}