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
exports.JWTServiceClass = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inversify_1 = require("inversify");
const env_config_1 = __importDefault(require("../../../config/env-config"));
const logger_1 = __importDefault(require("../../../core/utils/logger"));
const error_handler_1 = require("../../../core/utils/error-handler");
let JWTServiceClass = class JWTServiceClass {
    constructor(userRepository) {
        this.generateAccessToken = (payload, expiresIn = '1h') => {
            if (!env_config_1.default.jwtSecret) {
                logger_1.default.error('JWT secret is not defined');
                throw new error_handler_1.ServiceError('JWT secret is not defined');
            }
            if (typeof payload !== 'object' || payload === null) {
                logger_1.default.error('Payload must be a plain object');
                throw new error_handler_1.ServiceError('Payload must be a plain object');
            }
            try {
                const token = jsonwebtoken_1.default.sign(payload, env_config_1.default.jwtSecret, { expiresIn });
                logger_1.default.debug(`Generated access token for payload: ${JSON.stringify(payload)}`);
                return token;
            }
            catch (error) {
                logger_1.default.error(`Failed to generate access token: ${error.message}`);
                throw new error_handler_1.ServiceError(`Failed to generate access token: ${error.message}`);
            }
        };
        this.verifyAccessToken = (token) => {
            logger_1.default.info(`Token Received : ${token}`);
            if (!env_config_1.default.jwtSecret) {
                logger_1.default.error('JWT secret is not defined');
                throw new error_handler_1.ServiceError('JWT secret is not defined');
            }
            try {
                const payload = jsonwebtoken_1.default.verify(token, env_config_1.default.jwtSecret);
                logger_1.default.info(`Payload after verification : ${payload}`);
                if (!payload) {
                    throw new error_handler_1.ServiceError('Payload for JWT not verified');
                }
                logger_1.default.debug(`Verified access token: ${token}`);
                return payload;
            }
            catch (error) {
                logger_1.default.info(error);
                logger_1.default.error(`Invalid or expired access token: ${token}`);
                throw new error_handler_1.ServiceError('Invalid or expired access token');
            }
        };
        this.generateRefreshToken = (payload) => {
            if (!env_config_1.default.jwtSecret) {
                logger_1.default.error('JWT secret is not defined');
                throw new error_handler_1.ServiceError('JWT secret is not defined');
            }
            if (typeof payload !== 'object' || payload === null) {
                logger_1.default.error('Payload must be a plain object');
                throw new error_handler_1.ServiceError('Payload must be a plain object');
            }
            try {
                const token = jsonwebtoken_1.default.sign(payload, env_config_1.default.jwtSecret, { expiresIn: '7d' });
                logger_1.default.debug(`Generated refresh token for payload: ${JSON.stringify(payload)}`);
                return token;
            }
            catch (error) {
                logger_1.default.error(`Failed to generate refresh token: ${error.message}`);
                throw new error_handler_1.ServiceError(`Failed to generate refresh token: ${error.message}`);
            }
        };
        this.verifyRefreshToken = (token) => {
            if (!env_config_1.default.jwtSecret) {
                logger_1.default.error('JWT secret is not defined');
                throw new error_handler_1.ServiceError('JWT secret is not defined');
            }
            try {
                const payload = jsonwebtoken_1.default.verify(token, env_config_1.default.jwtSecret);
                logger_1.default.debug(`Verified refresh token: ${token}`);
                return payload;
            }
            catch (error) {
                logger_1.default.info(error);
                logger_1.default.error(`Invalid or expired refresh token: ${token}`);
                throw new error_handler_1.ServiceError('Invalid or expired refresh token');
            }
        };
        this.setTokensInCookies = (res, accessToken, refreshToken) => {
            const isProduction = env_config_1.default.node_env === 'production';
            try {
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    maxAge: 60 * 60 * 1000, // 1 hour
                });
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });
                logger_1.default.debug('Set accessToken and refreshToken in cookies');
            }
            catch (error) {
                logger_1.default.error(`Failed to set tokens in cookies: ${error.message}`);
                throw new error_handler_1.ServiceError(`Failed to set tokens in cookies: ${error.message}`);
            }
        };
        this.clearCookies = (res) => {
            try {
                res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
                res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
                logger_1.default.debug('Cleared accessToken and refreshToken cookies');
            }
            catch (error) {
                logger_1.default.error(`Failed to clear cookies: ${error.message}`);
                throw new error_handler_1.ServiceError(`Failed to clear cookies: ${error.message}`);
            }
        };
        this.removeRefreshToken = async (userEmail) => {
            try {
                const user = await this.userRepo.findUserByEmail(userEmail);
                if (!user) {
                    logger_1.default.error(`User not found for email: ${userEmail}`);
                    throw new error_handler_1.ServiceError('User not found');
                }
                await this.userRepo.removeRefreshToken(userEmail);
                logger_1.default.info(`Refresh token removed for user: ${userEmail}`);
                return { message: 'Refresh token removed successfully' };
            }
            catch (error) {
                logger_1.default.error(`Error removing refresh token for user ${userEmail}: ${error.message}`);
                throw new error_handler_1.ServiceError(`Error removing refresh token: ${error.message}`);
            }
        };
        this.userRepo = userRepository;
    }
};
exports.JWTServiceClass = JWTServiceClass;
exports.JWTServiceClass = JWTServiceClass = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], JWTServiceClass);
//# sourceMappingURL=j-w-t.js.map