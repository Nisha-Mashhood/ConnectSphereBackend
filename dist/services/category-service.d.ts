import { ICategoryRepository } from "../Interfaces/Repository/i-category-repositry";
import { ISubcategoryRepository } from "../Interfaces/Repository/i-sub-category-repositry";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { ICategory } from "../Interfaces/Models/i-category";
import { ICategoryService } from "../Interfaces/Services/i-category-service";
import { ICategoryDTO } from "../Interfaces/DTOs/i-category-dto";
export declare class CategoryService implements ICategoryService {
    private categoryRepo;
    private subcategoryRepo;
    private skillsRepo;
    constructor(categoryRepository: ICategoryRepository, subcategoryRepository: ISubcategoryRepository, skillsRepository: ISkillsRepository);
    isDuplicateCategoryName: (name?: string, excludeId?: string) => Promise<boolean>;
    createCategory: (data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategoryDTO>;
    getAllCategories: (query?: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        categories: ICategoryDTO[];
        total: number;
    }>;
    fetchAllCategories: () => Promise<{
        categories: ICategoryDTO[];
    }>;
    getCategoryById: (id: string) => Promise<ICategoryDTO | null>;
    updateCategory: (id: string, data: Partial<ICategory>, imagePath?: string, fileSize?: number) => Promise<ICategoryDTO | null>;
    deleteCategory: (id: string) => Promise<ICategoryDTO | null>;
}
//# sourceMappingURL=category-service.d.ts.map