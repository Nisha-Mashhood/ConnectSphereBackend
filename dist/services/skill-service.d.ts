import { ISkill } from "../Interfaces/Models/i-skill";
import { ISkillsService } from "../Interfaces/Services/i-skills-service";
import { ISkillsRepository } from "../Interfaces/Repository/i-skills-repositry";
import { ISkillDTO } from "../Interfaces/DTOs/i-skill-dto";
export declare class SkillsService implements ISkillsService {
    private _skillsRepository;
    constructor(skillRepository: ISkillsRepository);
    createSkill: (data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkillDTO>;
    getAllSkills: (subcategoryId: string, query?: {
        search?: string;
        page?: number;
        limit?: number;
    }) => Promise<{
        skills: ISkillDTO[];
        total: number;
    }>;
    getSkillById: (id: string) => Promise<ISkillDTO | null>;
    updateSkill: (id: string, data: Partial<ISkill>, imagePath?: string, fileSize?: number) => Promise<ISkillDTO | null>;
    deleteSkill: (id: string) => Promise<ISkillDTO | null>;
    getSkills: () => Promise<{
        _id: string;
        name: string;
    }[]>;
}
//# sourceMappingURL=skill-service.d.ts.map