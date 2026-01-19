import { BaseController } from '../core/controller/base-controller';
import { Request, Response, NextFunction } from 'express';
import { ForgotPasswordRequestBody, LoginRequestBody, LogoutRequestBody, OAuthRequestBody, RefreshTokenRequestBody, ResetPasswordRequestBody, SignupRequestBody, UpdateProfileRequestBody, VerifyOTPRequestBody, VerifyPasskeyRequestBody, UpdatePasswordRequestBody } from '../Utils/types/auth-types';
import { IAuthController } from '../Interfaces/Controller/i-auth-controller';
import { IAuthService } from '../Interfaces/Services/i-user-service';
import { IJWTService } from '../Interfaces/Services/i-jwt-service';
export declare class AuthController extends BaseController implements IAuthController {
    private _authService;
    private _jwtService;
    constructor(authService: IAuthService, jwtService: IJWTService);
    signup: (req: Request<{}, {}, SignupRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    googleSignup: (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    googleLogin: (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    githubSignup: (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    githubLogin: (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    refreshToken: (req: Request<{}, {}, RefreshTokenRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    checkProfile: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    getProfileDetails: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    updateUserDetails: (req: Request<{
        id: string;
    }, {}, UpdateProfileRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    updatePassword: (req: Request<{
        id: string;
    }, {}, UpdatePasswordRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: Request<{}, {}, LogoutRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    handleForgotPassword: (req: Request<{}, {}, ForgotPasswordRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    handleVerifyOTP: (req: Request<{}, {}, VerifyOTPRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    resendOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    handleResetPassword: (req: Request<{}, {}, ResetPasswordRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    verifyPasskey: (req: Request<{}, {}, VerifyPasskeyRequestBody>, res: Response, next: NextFunction) => Promise<void>;
    getAllUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    fetchAllUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserById: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    blockUser: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    unblockUser: (req: Request<{
        id: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    changeRole: (req: Request<{
        id: string;
    }, {}, {
        role: string;
    }>, res: Response, next: NextFunction) => Promise<void>;
    getAllUsersAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auth-controller.d.ts.map