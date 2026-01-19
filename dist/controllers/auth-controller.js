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
exports.AuthController = void 0;
const base_controller_1 = require("../core/controller/base-controller");
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let AuthController = class AuthController extends base_controller_1.BaseController {
    constructor(authService, jwtService) {
        super();
        // Handle user signup
        this.signup = async (req, res, next) => {
            try {
                const { name, email, password } = req.body;
                logger_1.default.debug(`Signup attempt for email: ${email}`);
                if (!name || !email || !password) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_NAME_EMAIL_PASSWORD, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { user, otpId } = await this._authService.signup({ name, email, password });
                this.sendCreated(res, { email: user.email, otpId }, messages_1.AUTH_MESSAGES.SIGNUP_SUCCESS);
                logger_1.default.info(`User registered: ${user.name} (${email})`);
            }
            catch (error) {
                logger_1.default.error(`Error in signup for email ${req.body.email || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Handle user login
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                logger_1.default.debug(`Login attempt for email: ${email}`);
                if (!email || !password) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL_PASSWORD, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { user, otpId } = await this._authService.login(email, password);
                // this._jwtService.setTokensInCookies(res, accessToken, refreshToken);
                this.sendSuccess(res, { user, otpId }, messages_1.AUTH_MESSAGES.LOGIN_SUCCESS);
                logger_1.default.info(`User logged in otp send for: ${user.userId} (${email})`);
            }
            catch (error) {
                logger_1.default.error(`Error in login for email ${req.body.email || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Handle Google signup
        this.googleSignup = async (req, res, next) => {
            try {
                const { code } = req.body;
                logger_1.default.debug(`Google signup attempt with code: ${code}`);
                if (!code) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_AUTH_CODE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { user, otpId } = await this._authService.googleSignup(code);
                this.sendCreated(res, { email: user.email, otpId }, messages_1.AUTH_MESSAGES.GOOGLE_SIGNUP_SUCCESS);
                logger_1.default.info(`Google signup completed for user: ${user.userId} (${user.email})`);
            }
            catch (error) {
                logger_1.default.error(`Error in Google signup: ${error}`);
                next(error);
            }
        };
        // Handle Google login
        this.googleLogin = async (req, res, next) => {
            try {
                const { code } = req.body;
                logger_1.default.debug(`Google login attempt with code: ${code}`);
                if (!code) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_AUTH_CODE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { user, otpId } = await this._authService.googleLogin(code);
                this.sendSuccess(res, { user, otpId }, messages_1.AUTH_MESSAGES.GOOGLE_LOGIN_SUCCESS);
                logger_1.default.info(`Google login completed for user: ${user.userId} (${user.email})`);
            }
            catch (error) {
                logger_1.default.error(`Error in Google login: ${error}`);
                next(error);
            }
        };
        // Handle GitHub signup
        this.githubSignup = async (req, res, next) => {
            try {
                const { code } = req.body;
                logger_1.default.debug(`GitHub signup attempt with code: ${code}`);
                if (!code) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_AUTH_CODE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { user, otpId } = await this._authService.githubSignup(code);
                this.sendCreated(res, { email: user.email, otpId }, messages_1.AUTH_MESSAGES.GITHUB_SIGNUP_SUCCESS);
                logger_1.default.info(`GitHub signup completed for user: ${user.userId} (${user.email})`);
            }
            catch (error) {
                logger_1.default.error(`Error in GitHub signup: ${error}`);
                next(error);
            }
        };
        // Handle GitHub login
        this.githubLogin = async (req, res, next) => {
            try {
                const { code } = req.body;
                logger_1.default.debug(`GitHub login attempt with code: ${code}`);
                if (!code) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_AUTH_CODE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { user, otpId } = await this._authService.githubLogin(code);
                this.sendSuccess(res, { user, otpId }, messages_1.AUTH_MESSAGES.GITHUB_LOGIN_SUCCESS);
                logger_1.default.info(`GitHub login completed for user: ${user.userId} (${user.email})`);
            }
            catch (error) {
                logger_1.default.error(`Error in GitHub login: ${error}`);
                next(error);
            }
        };
        // Handle refresh token
        this.refreshToken = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                logger_1.default.debug(`Refresh token attempt`);
                if (!refreshToken) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_REFRESH_TOKEN, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { newAccessToken } = await this._authService.refreshToken(refreshToken);
                res.cookie("accessToken", newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 15 * 60 * 1000,
                });
                this.sendSuccess(res, { newAccessToken }, messages_1.AUTH_MESSAGES.REFRESH_SUCCESS);
                logger_1.default.info(`Access token refreshed`);
            }
            catch (error) {
                logger_1.default.error(`Error in refresh token: ${error}`);
                next(error);
            }
        };
        // Check profile completion
        this.checkProfile = async (req, res, next) => {
            try {
                const userId = req.params.id;
                logger_1.default.debug(`Checking profile completion for userId: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isComplete = await this._authService.checkProfileCompletion(userId);
                this.sendSuccess(res, { isProfileComplete: isComplete }, messages_1.AUTH_MESSAGES.PROFILE_CHECKED);
                logger_1.default.info(`Profile completion checked for userId: ${userId}: ${isComplete}`);
            }
            catch (error) {
                logger_1.default.error(`Error checking profile for userId ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Get profile details
        this.getProfileDetails = async (req, res, next) => {
            try {
                const userId = req.params.id;
                logger_1.default.debug(`Fetching profile details for userId: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const userDetails = await this._authService.profileDetails(userId);
                if (!userDetails) {
                    this.sendSuccess(res, { userDetails: null }, messages_1.AUTH_MESSAGES.NO_USER_FOUND);
                    logger_1.default.info(`No user found for ID: ${userId}`);
                    return;
                }
                this.sendSuccess(res, { userDetails }, messages_1.AUTH_MESSAGES.PROFILE_FETCHED);
                logger_1.default.info(`Profile details fetched for userId: ${userId}`);
            }
            catch (error) {
                logger_1.default.error(`Error fetching profile details for userId ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Update user profile
        this.updateUserDetails = async (req, res, next) => {
            try {
                const userId = req.params.id;
                logger_1.default.debug(`Updating profile for userId: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const data = req.body;
                const profilePicFile = req.files?.["profilePic"]?.[0];
                const coverPicFile = req.files?.["coverPic"]?.[0];
                if (profilePicFile)
                    data.profilePicFile = profilePicFile;
                if (coverPicFile)
                    data.coverPicFile = coverPicFile;
                const updatedUser = await this._authService.updateUserProfile(userId, data);
                this.sendSuccess(res, { user: updatedUser }, messages_1.AUTH_MESSAGES.PROFILE_UPDATED);
                logger_1.default.info(`Profile updated for userId: ${userId}`);
            }
            catch (error) {
                logger_1.default.error(`Error updating profile for userId ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Update user password
        this.updatePassword = async (req, res, next) => {
            try {
                const userId = req.params.id;
                logger_1.default.debug(`Updating password for userId: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { currentPassword, newPassword } = req.body;
                if (!currentPassword || !newPassword) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_CURRENT_NEW_PASSWORD, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedUser = await this._authService.updatePassword(userId, currentPassword, newPassword);
                this.sendSuccess(res, { user: updatedUser }, messages_1.AUTH_MESSAGES.PASSWORD_UPDATED);
                logger_1.default.info(`Password updated for userId: ${userId}`);
            }
            catch (error) {
                logger_1.default.error(`Error updating password for userId ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Handle logout
        this.logout = async (req, res, next) => {
            try {
                const { email } = req.body;
                logger_1.default.debug(`Logout attempt for email: ${email}`);
                if (!email) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._authService.logout(email);
                this._jwtService.clearCookies(res);
                this.sendSuccess(res, {}, messages_1.AUTH_MESSAGES.LOGOUT_SUCCESS);
                logger_1.default.info(`User logged out: ${email}`);
            }
            catch (error) {
                logger_1.default.error(`Error in logout for email ${req.body.email || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Handle forgot password
        this.handleForgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                logger_1.default.debug(`Forgot password request for email: ${email}`);
                if (!email) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const otpId = await this._authService.forgotPassword(email);
                this.sendSuccess(res, { otpId }, messages_1.AUTH_MESSAGES.OTP_SENT);
                logger_1.default.info(`OTP sent to email: ${email}`);
            }
            catch (error) {
                logger_1.default.error(`Error in forgot password for email ${req.body.email || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Handle verify OTP
        this.handleVerifyOTP = async (req, res, next) => {
            try {
                const { purpose, email, otpId, otp } = req.body;
                logger_1.default.debug(`Verify OTP attempt for email: ${email}`);
                if (!email || !otp) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL_OTP, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const result = await this._authService.verifyOTP(purpose, email, otpId, otp);
                if (result.purpose === "login") {
                    this._jwtService.setTokensInCookies(res, result.accessToken, result.refreshToken);
                }
                this.sendSuccess(res, result, messages_1.AUTH_MESSAGES.OTP_VERIFIED);
                logger_1.default.info(`OTP verified for email: ${email}`);
            }
            catch (error) {
                logger_1.default.error(`Error verifying OTP for email ${req.body.email || "unknown"}: ${error}`);
                next(error);
            }
        };
        this.resendOtp = async (req, res, next) => {
            try {
                const { email, purpose } = req.body;
                if (!email || !purpose) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL_AND_PURPOSE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const { otpId } = await this._authService.resendOtp(email, purpose);
                this.sendSuccess(res, { otpId }, messages_1.AUTH_MESSAGES.OTP_SENT);
            }
            catch (error) {
                next(error);
            }
        };
        // Handle reset password
        this.handleResetPassword = async (req, res, next) => {
            try {
                const { email, newPassword } = req.body;
                logger_1.default.debug(`Reset password attempt for email: ${email}`);
                if (!email || !newPassword) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_EMAIL_NEW_PASSWORD, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._authService.resetPassword(email, newPassword);
                this.sendSuccess(res, {}, messages_1.AUTH_MESSAGES.PASSWORD_RESET);
                logger_1.default.info(`Password reset for email: ${email}`);
            }
            catch (error) {
                logger_1.default.error(`Error resetting password for email ${req.body.email || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Verify admin passkey
        this.verifyPasskey = async (req, res, next) => {
            try {
                const { passkey } = req.body;
                logger_1.default.debug(`Verify admin passkey attempt`);
                if (!passkey) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_PASSKEY, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isValid = await this._authService.verifyAdminPasskey(passkey);
                this.sendSuccess(res, { valid: isValid }, messages_1.AUTH_MESSAGES.PASSKEY_VERIFIED);
                logger_1.default.info(`Admin passkey verification: ${isValid}`);
            }
            catch (error) {
                logger_1.default.error(`Error verifying admin passkey: ${error}`);
                next(error);
            }
        };
        // Get all User Details
        this.getAllUsers = async (req, res, next) => {
            try {
                const { search, page, limit, excludeId } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                if (excludeId)
                    query.excludeId = excludeId;
                logger_1.default.debug(`Fetching users with query: ${JSON.stringify(query)}`);
                const result = await this._authService.getAllUsers(query);
                const data = {
                    users: result.users,
                    total: result.total,
                    page: query.page || 1,
                    limit: query.limit || 10,
                };
                if (result.users.length === 0) {
                    this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, messages_1.AUTH_MESSAGES.NO_USERS_FOUND);
                }
                else if (!search && !page && !limit) {
                    this.sendSuccess(res, { users: result.users }, messages_1.AUTH_MESSAGES.USERS_FETCHED);
                }
                else {
                    this.sendSuccess(res, data, messages_1.AUTH_MESSAGES.USERS_FETCHED);
                }
                logger_1.default.info("Users fetched successfully");
            }
            catch (error) {
                logger_1.default.error(`Error in getAllUsers: ${error.message}`);
                next(error);
            }
        };
        this.fetchAllUsers = async (req, res, next) => {
            try {
                const { search, page, limit, excludeId, status } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                if (excludeId)
                    query.excludeId = excludeId;
                if (status)
                    query.status = status;
                logger_1.default.debug(`Fetching users with query: ${JSON.stringify(query)}`);
                const result = await this._authService.getAllUsersAdmin(query);
                const data = {
                    users: result.users,
                    total: result.total,
                    page: query.page || 1,
                    limit: query.limit || 10,
                };
                if (result.users.length === 0) {
                    this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, messages_1.AUTH_MESSAGES.NO_USERS_FOUND);
                }
                else if (!search && !page && !limit) {
                    this.sendSuccess(res, { users: result.users }, messages_1.AUTH_MESSAGES.USERS_FETCHED);
                }
                else {
                    this.sendSuccess(res, data, messages_1.AUTH_MESSAGES.USERS_FETCHED);
                }
                logger_1.default.info("Users fetched successfully");
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        // Get user Details by Id
        this.getUserById = async (req, res, next) => {
            try {
                const { id } = req.params;
                logger_1.default.debug(`Fetching user by ID: ${id}`);
                if (!id) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const user = await this._authService.profileDetails(id);
                if (!user) {
                    this.sendSuccess(res, { user: null }, messages_1.AUTH_MESSAGES.NO_USER_FOUND);
                    logger_1.default.info(`No user found for ID: ${id}`);
                    return;
                }
                this.sendSuccess(res, { user }, messages_1.AUTH_MESSAGES.USER_FETCHED);
                logger_1.default.info(`Fetched user: ${id}`);
            }
            catch (error) {
                logger_1.default.error(`Error fetching user ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Block the given User
        this.blockUser = async (req, res, next) => {
            try {
                const { id } = req.params;
                logger_1.default.debug(`Blocking user: ${id}`);
                if (!id) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._authService.blockUser(id);
                this.sendSuccess(res, {}, messages_1.AUTH_MESSAGES.USER_BLOCKED);
                logger_1.default.info(`Blocked user: ${id}`);
            }
            catch (error) {
                logger_1.default.error(`Error blocking user ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Unblock the given user
        this.unblockUser = async (req, res, next) => {
            try {
                const { id } = req.params;
                logger_1.default.debug(`Unblocking user: ${id}`);
                if (!id) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._authService.unblockUser(id);
                this.sendSuccess(res, {}, messages_1.AUTH_MESSAGES.USER_UNBLOCKED);
                logger_1.default.info(`Unblocked user: ${id}`);
            }
            catch (error) {
                logger_1.default.error(`Error unblocking user ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        // Change the user role
        this.changeRole = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { role } = req.body;
                logger_1.default.debug(`Changing role for user: ${id} to ${role}`);
                if (!id || !role) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID_ROLE, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedUser = await this._authService.changeRole(id, role);
                this.sendSuccess(res, { user: updatedUser }, messages_1.AUTH_MESSAGES.ROLE_CHANGED);
                logger_1.default.info(`Updated role for user: ${id} to ${role}`);
            }
            catch (error) {
                logger_1.default.error(`Error changing role for user ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        this.getAllUsersAdmin = async (req, res, next) => {
            try {
                const { search, page, limit } = req.query;
                const query = {};
                if (search)
                    query.search = search;
                if (page)
                    query.page = parseInt(page, 10);
                if (limit)
                    query.limit = parseInt(limit, 10);
                logger_1.default.debug(`Fetching users for admin with query: ${JSON.stringify(query)}`);
                const result = await this._authService.getAllUsersAdmin(query);
                const data = {
                    users: result.users,
                    total: result.total,
                    page: query.page || 1,
                    limit: query.limit || 10,
                };
                if (result.users.length === 0) {
                    this.sendSuccess(res, { users: [], total: 0, page: query.page || 1, limit: query.limit || 10 }, messages_1.AUTH_MESSAGES.NO_USERS_FOUND);
                }
                else {
                    this.sendSuccess(res, data, messages_1.AUTH_MESSAGES.USERS_ADMIN_FETCHED);
                }
                logger_1.default.info("Users fetched successfully for admin");
            }
            catch (error) {
                logger_1.default.error(`Error in getAllUsersAdmin: ${error.message}`);
                next(error);
            }
        };
        this._authService = authService;
        this._jwtService = jwtService;
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IUserService')),
    __param(1, (0, inversify_1.inject)('IJWTService')),
    __metadata("design:paramtypes", [Object, Object])
], AuthController);
//# sourceMappingURL=auth-controller.js.map