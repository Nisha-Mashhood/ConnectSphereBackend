import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/controller/base-controller";
import { ICollaborationController } from "../Interfaces/Controller/i-collaboration-controller";
import { ICollaborationService } from "../Interfaces/Services/i-collaboration-service";
export declare class CollaborationController extends BaseController implements ICollaborationController {
    private _collabService;
    constructor(collaborationService: ICollaborationService);
    TemporaryRequestController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorRequestsController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    acceptRequestController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    rejectRequestController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRequestForUserController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    makeStripePaymentController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCollabDataForUserController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCollabDataForMentorController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelAndRefundCollab: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllMentorRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllCollabs: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCollabDetailsByCollabId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRequestDetailsByRequestId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markUnavailableDays: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateTemporarySlotChanges: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    approveTimeSlotRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMentorLockedSlotsController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    downloadReceiptController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteMentorRequestController: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=collaboration-controller.d.ts.map