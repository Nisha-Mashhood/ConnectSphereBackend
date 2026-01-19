import { NextFunction, Request, Response } from 'express';
import { IReviewController } from '../Interfaces/Controller/i-review-controller';
import { BaseController } from '../core/controller/base-controller';
import { IReviewService } from '../Interfaces/Services/i-review-service';
export declare class ReviewController extends BaseController implements IReviewController {
    private _reviewService;
    constructor(reviewService: IReviewService);
    submitReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    skipReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    approveReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    selectReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelApproval: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deselectReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSelectedReviews: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=review-controller.d.ts.map