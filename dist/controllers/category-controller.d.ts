import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/controller/base-controller";
import { CategoryRequest } from "../Utils/types/category-types";
import { ICategoryController } from "../Interfaces/Controller/i-category-controller";
import { ICategoryService } from "../Interfaces/Services/i-category-service";
export declare class CategoryController extends BaseController implements ICategoryController {
    private _categoryService;
    constructor(categoryService: ICategoryService);
    createCategory: (req: CategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    getAllCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    fetchAllCategories: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCategoryById: (req: CategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    updateCategory: (req: CategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteCategory: (req: CategoryRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=category-controller.d.ts.map