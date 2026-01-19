import { NextFunction, Request, Response } from 'express';
import { IContactMessageController } from '../Interfaces/Controller/i-contact-us-controller';
import { BaseController } from '../core/controller/base-controller';
import { IContactMessageService } from '../Interfaces/Services/i-contact-message-service';
export declare class ContactMessageController extends BaseController implements IContactMessageController {
    private _contactMessageService;
    constructor(contactMessageService: IContactMessageService);
    createContactMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllContactMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendReply: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=contactUs-controller.d.ts.map