import { BaseRepository } from "../core/repositries/base-repositry";
import { ISubcategory } from "../Interfaces/Models/i-sub-category";
import { ISubcategoryRepository } from "../Interfaces/Repository/i-sub-category-repositry";
export declare class SubcategoryRepository extends BaseRepository<ISubcategory> implements ISubcategoryRepository {
    constructor();
    createSubcategory: (data: Partial<ISubcategory>) => Promise<ISubcategory>;
    getAllSubcategories: (categoryId: string, query: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        subcategories: ISubcategory[];
        total: number;
    }>;
    getSubcategoryById: (id: string) => Promise<ISubcategory | null>;
    updateSubcategory: (id: string, data: Partial<ISubcategory>) => Promise<ISubcategory | null>;
    deleteSubcategory: (id: string) => Promise<ISubcategory | null>;
    deleteManySubcategories: (categoryId: string) => Promise<{
        deletedCount: number;
    }>;
    isDuplicateSubcategory: (name: string, categoryId: string, excludeId?: string) => Promise<boolean>;
}
//# sourceMappingURL=sub-category-repository.d.ts.map