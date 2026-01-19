import { Response } from 'express';
import { IUserRepository } from '../../../Interfaces/Repository/i-user-repositry';
import { IJWTService } from '../../../Interfaces/Services/i-jwt-service';
interface JwtPayload {
    [key: string]: any;
}
export declare class JWTServiceClass implements IJWTService {
    private userRepo;
    constructor(userRepository: IUserRepository);
    generateAccessToken: (payload: JwtPayload, expiresIn?: string) => string;
    verifyAccessToken: (token: string) => JwtPayload;
    generateRefreshToken: (payload: JwtPayload) => string;
    verifyRefreshToken: (token: string) => JwtPayload;
    setTokensInCookies: (res: Response, accessToken: string, refreshToken: string) => void;
    clearCookies: (res: Response) => void;
    removeRefreshToken: (userEmail: string) => Promise<{
        message: string;
    }>;
}
export {};
//# sourceMappingURL=j-w-t.d.ts.map