import { ICategoryRepository } from "../Interfaces/Repository/i-category-repositry";
import { BaseRepository } from "../core/repositries/base-repositry";
import { ICategory } from "../Interfaces/Models/i-category";
export declare class CategoryRepository extends BaseRepository<ICategory> implements ICategoryRepository {
    constructor();
    createCategory: (data: Partial<ICategory>) => Promise<ICategory>;
    getAllCategories: (query?: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        categories: ICategory[];
        total: number;
    }>;
    fetchAllCategories: () => Promise<{
        categories: ICategory[];
    }>;
    getCategoryById: (id: string) => Promise<ICategory | null>;
    updateCategory: (id: string, data: Partial<ICategory>) => Promise<ICategory | null>;
    deleteCategory: (id: string) => Promise<ICategory | null>;
    isDuplicateCategoryName: (name?: string, excludeId?: string) => Promise<boolean>;
}
//# sourceMappingURL=category-repository.d.ts.map