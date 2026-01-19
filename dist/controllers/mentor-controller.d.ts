import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/controller/base-controller";
import { IMentorController } from "../Interfaces/Controller/i-mentor-controller";
import { IMentorService } from "../Interfaces/Services/i-mentor-service";
export declare class MentorController extends BaseController implements IMentorController {
    private _mentorService;
    constructor(mentorService: IMentorService);
    checkMentorStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorExperiences: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createMentor: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllMentorRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllMentors: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    approveMentorRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    rejectMentorRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelMentorship: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateMentorProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorAnalytics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSalesReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    addExperience: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateExperience: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteExperience: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    downloadSalesReportPDF: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=mentor-controller.d.ts.map