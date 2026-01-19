import { NextFunction, Request, Response } from 'express';
import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import { BaseController } from '../core/controller/base-controller';
import { ISubcategoryController } from '../Interfaces/Controller/i-sub-category-controller';
import { ISubcategoryService } from '../Interfaces/Services/i-sub-category-service';
interface SubcategoryRequest extends Request {
    body: Partial<ISubcategory>;
    params: {
        id?: string;
        categoryId?: string;
    };
}
export declare class SubcategoryController extends BaseController implements ISubcategoryController {
    private _subcategoryService;
    constructor(subCategoryService: ISubcategoryService);
    createSubcategory: (req: SubcategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    getAllSubcategories: (req: SubcategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    getSubcategoryById: (req: SubcategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    updateSubcategory: (req: SubcategoryRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteSubcategory: (req: SubcategoryRequest, res: Response, next: NextFunction) => Promise<void>;
}
export {};
//# sourceMappingURL=subCategory-controller.d.ts.map