"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
let AuthMiddleware = class AuthMiddleware {
    constructor(jwtService, userRepository) {
        this.verifyToken = async (req, _res, next) => {
            const accessToken = req.cookies.accessToken;
            logger_1.default.info(`Access Token: ${accessToken}`);
            if (!accessToken) {
                logger_1.default.warn('Access token not found in request');
                req.currentUser = undefined;
                return next();
            }
            try {
                const decoded = this._jwtService.verifyAccessToken(accessToken);
                logger_1.default.info(`Decoded Info: ${JSON.stringify(decoded)}`);
                const user = await this._userRepository.getUserById(decoded.userId);
                logger_1.default.debug(`Current user: ${user?._id}`);
                if (!user) {
                    logger_1.default.warn(`User not found for ID: ${decoded.userId}`);
                    throw new error_handler_1.ServiceError('User not found');
                }
                req.currentUser = user;
                next();
            }
            catch (error) {
                logger_1.default.error(`Token verification failed: ${error.message}`);
                throw new error_handler_1.ServiceError('Invalid or expired token');
            }
        };
        this.verifyRefreshToken = async (req, _res, next) => {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                logger_1.default.warn('Refresh token not found in request');
                throw new error_handler_1.ServiceError('Refresh token not found');
            }
            try {
                const decoded = this._jwtService.verifyRefreshToken(refreshToken);
                const user = await this._userRepository.getUserById(decoded.userId);
                if (!user || user.refreshToken !== refreshToken) {
                    logger_1.default.warn(`Invalid refresh token for user ID: ${decoded.userId}`);
                    throw new error_handler_1.ServiceError('Invalid refresh token');
                }
                req.currentUser = user;
                next();
            }
            catch (error) {
                logger_1.default.error(`Refresh token verification failed: ${error.message}`);
                throw new error_handler_1.ServiceError('Invalid or expired refresh token');
            }
        };
        this.checkBlockedStatus = async (req, _res, next) => {
            if (req.currentUser?.isBlocked) {
                logger_1.default.warn(`Blocked user attempted access: ${req.currentUser._id}`);
                throw new error_handler_1.ServiceError('Your account has been blocked. Please contact support.');
            }
            next();
        };
        this.authorize = (...allowedRoles) => {
            return (req, _res, next) => {
                if (!req.currentUser) {
                    logger_1.default.warn('Authentication required for protected route');
                    throw new error_handler_1.ServiceError('Authentication required');
                }
                const userRole = req.currentUser.role ?? '';
                if (!allowedRoles.includes(userRole)) {
                    logger_1.default.warn(`Access forbidden for user ${req.currentUser._id} with role ${userRole}`);
                    throw new error_handler_1.ServiceError('Access forbidden');
                }
                logger_1.default.debug(`Authorized user ${req.currentUser._id} with role ${userRole}`);
                next();
            };
        };
        this._jwtService = jwtService;
        this._userRepository = userRepository;
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IJWTService')),
    __param(1, (0, inversify_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object])
], AuthMiddleware);
//# sourceMappingURL=auth-middleware.js.map