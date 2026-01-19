import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../core/controller/base-controller';
import { IContactController } from '../Interfaces/Controller/i-contact-controller';
import { IContactService } from '../Interfaces/Services/i-contact-service';
export declare class ContactController extends BaseController implements IContactController {
    private _contactService;
    constructor(contactService: IContactService);
    getUserContacts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=contact-controller.d.ts.map