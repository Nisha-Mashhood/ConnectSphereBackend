import { Request, Response, NextFunction } from "express";
export declare const upload: {
    fields: (fields: {
        name: string;
        maxCount?: number;
    }[]) => (req: Request, res: Response, next: NextFunction) => void;
    single: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
    array: (fieldName: string, maxCount?: number) => (req: Request, res: Response, next: NextFunction) => void;
    any: () => (req: Request, res: Response, next: NextFunction) => void;
};
//# sourceMappingURL=multer.d.ts.map