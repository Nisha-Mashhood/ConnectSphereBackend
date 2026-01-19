import { Request, Response, NextFunction } from 'express';
import { IUser } from '../Interfaces/Models/i-user';
import { IJWTService } from '../Interfaces/Services/i-jwt-service';
import { IUserRepository } from '../Interfaces/Repository/i-user-repositry';
import { IAuthMiddleware } from '../Interfaces/Middleware/i-auth-middleware';
declare global {
    namespace Express {
        interface Request {
            currentUser?: IUser;
        }
    }
}
export declare class AuthMiddleware implements IAuthMiddleware {
    private _jwtService;
    private _userRepository;
    constructor(jwtService: IJWTService, userRepository: IUserRepository);
    verifyToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    verifyRefreshToken: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    checkBlockedStatus: (req: Request, _res: Response, next: NextFunction) => Promise<void>;
    authorize: (...allowedRoles: string[]) => (req: Request, _res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=auth-middleware.d.ts.map