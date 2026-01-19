import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../core/controller/base-controller';
import { ISkillsController } from '../Interfaces/Controller/i-skills-controller';
import { ISkillsService } from '../Interfaces/Services/i-skills-service';
import { ISkill } from "../Interfaces/Models/i-skill";
export interface SkillRequest extends Request {
    body: Partial<ISkill>;
    params: {
        id?: string;
        subcategoryId?: string;
    };
}
export declare class SkillsController extends BaseController implements ISkillsController {
    private _skillsService;
    constructor(skillService: ISkillsService);
    createSkill: (req: SkillRequest, res: Response, next: NextFunction) => Promise<void>;
    getAllSkills: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSkillById: (req: SkillRequest, res: Response, next: NextFunction) => Promise<void>;
    updateSkill: (req: SkillRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteSkill: (req: SkillRequest, res: Response, next: NextFunction) => Promise<void>;
    getSkills: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=skills-controller.d.ts.map