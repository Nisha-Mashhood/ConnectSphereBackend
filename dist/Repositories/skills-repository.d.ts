import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { BaseRepository } from "../core/repositries/base-repositry";
import { ISkill } from "../Interfaces/Models/i-skill";
export declare class SkillsRepository extends BaseRepository<ISkill> implements ISkillsRepository {
    constructor();
    createSkill: (data: Partial<ISkill>) => Promise<ISkill>;
    getAllSkills: (subcategoryId: string, query?: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        skills: ISkill[];
        total: number;
    }>;
    getSkillById: (id: string) => Promise<ISkill | null>;
    updateSkill: (id: string, data: Partial<ISkill>) => Promise<ISkill | null>;
    deleteSkill: (id: string) => Promise<ISkill | null>;
    deleteManySkills: (categoryId: string) => Promise<{
        deletedCount: number;
    }>;
    deleteManySkillsBySubcategoryId: (subcategoryId: string) => Promise<{
        deletedCount: number;
    }>;
    getSkills: () => Promise<{
        _id: string;
        name: string;
    }[]>;
    isDuplicateSkill: (name: string, subcategoryId: string, excludeId?: string) => Promise<boolean>;
}
//# sourceMappingURL=skills-repository.d.ts.map