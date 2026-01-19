import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../Interfaces/Controller/i-admin-controller";
import { BaseController } from "../core/controller/base-controller";
import { IAdminService } from "../Interfaces/Services/i-admin-service";
import { UpdateProfileRequestBody } from "../Utils/types/auth-types";
export declare class AdminController extends BaseController implements IAdminController {
    private _adminService;
    constructor(adminService: IAdminService);
    getTotalUsersCount: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTotalMentorsCount: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTotalRevenue: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPendingMentorRequestsCount: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActiveCollaborationsCount: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRevenueTrends: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserGrowth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPendingMentorRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTopMentors: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRecentCollaborations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAdminProfileDetails: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    updateAdminDetails: (req: Request<{
        id: string;
    }, {}, UpdateProfileRequestBody>, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=admin-dashboard-controller.d.ts.map