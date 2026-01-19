import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import { ISubcategoryRepository } from "../Interfaces/Repository/i-sub-category-repositry";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { ISubcategoryDTO } from "../Interfaces/DTOs/i-sub-category-dto";
import { ISubcategoryService } from "../Interfaces/Services/i-sub-category-service";
export declare class SubcategoryService implements ISubcategoryService {
    private _subcategoryRepository;
    private _skillsRepository;
    constructor(subcategoryRepository: ISubcategoryRepository, skillsRepository: ISkillsRepository);
    createSubcategory: (data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO>;
    getAllSubcategories: (categoryId: string, query: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        subcategories: ISubcategoryDTO[];
        total: number;
    }>;
    getSubcategoryById: (id: string) => Promise<ISubcategoryDTO>;
    updateSubcategory: (id: string, data: Partial<ISubcategory>, imagePath?: string, fileSize?: number) => Promise<ISubcategoryDTO>;
    deleteSubcategory: (id: string) => Promise<ISubcategoryDTO>;
}
//# sourceMappingURL=sub-category-service.d.ts.map