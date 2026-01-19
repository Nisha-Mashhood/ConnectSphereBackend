import { Request, Response, NextFunction } from 'express';
import { IFeedbackController } from '../Interfaces/Controller/i-feedBack-controller';
import { BaseController } from '../core/controller/base-controller';
import { IFeedbackService } from '../Interfaces/Services/i-feedback-service';
export declare class FeedbackController extends BaseController implements IFeedbackController {
    private _feedbackService;
    constructor(feedbackService: IFeedbackService);
    createFeedback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorFeedbacks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserFeedbacks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFeedbackForProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFeedbackByCollaborationId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    toggleFeedback: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFeedbackByMentorId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=feedBack-controller.d.ts.map