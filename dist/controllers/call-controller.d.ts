import { Request, Response, NextFunction } from "express";
import { BaseController } from "../core/controller/base-controller";
import { ICallController } from "../Interfaces/Controller/i-call-controller";
import { ICallService } from "../Interfaces/Services/i-call-service";
export declare class CallController extends BaseController implements ICallController {
    private _callService;
    constructor(callService: ICallService);
    getCallLogsByUserId(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=call-controller.d.ts.map