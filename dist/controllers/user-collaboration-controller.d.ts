import { NextFunction, Request, Response } from 'express';
import { IUserConnectionController } from '../Interfaces/Controller/i-user-collaboration-controller';
import { BaseController } from '../core/controller/base-controller';
import { IUserConnectionService } from '../Interfaces/Services/i-user-collaboration-service';
export declare class UserConnectionController extends BaseController implements IUserConnectionController {
    private _userConnectionService;
    constructor(userConnectionServ: IUserConnectionService);
    sendRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    respondToRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    disconnectConnection: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserConnections: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAllUserConnections: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserConnectionById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=user-collaboration-controller.d.ts.map