import { Response } from 'express';
import { IBaseController } from '../interfaces/Ibase-controller';
export declare abstract class BaseController<T = unknown> implements IBaseController {
    sendSuccess: (res: Response, data: T, message?: string) => void;
    sendCreated: (res: Response, data: T, message?: string) => void;
    sendNoContent: (res: Response, message?: string) => void;
}
//# sourceMappingURL=base-controller.d.ts.map