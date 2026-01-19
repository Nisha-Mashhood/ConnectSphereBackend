import { NextFunction, Request, Response } from "express";
import { INotificationController } from "../Interfaces/Controller/i-notification-controller";
import { BaseController } from "../core/controller/base-controller";
import { INotificationService } from "../Interfaces/Services/i-notification-service";
export declare class NotificationController extends BaseController implements INotificationController {
    private _notificationService;
    constructor(notificationService: INotificationService);
    getNotifications: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    markAsRead: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUnreadCount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=notification-controller.d.ts.map