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
exports.AuthService = void 0;
const inversify_1 = require("inversify");
const error_handler_1 = require("../core/utils/error-handler");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const o_t_p_1 = require("../Utils/utils/auth-utils/o-t-p");
const env_config_1 = __importDefault(require("../config/env-config"));
const google_config_1 = require("../Utils/utils/auth-utils/google-config");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const user_mapper_1 = require("../Utils/mappers/user-mapper");
const cloudinary_1 = require("../core/utils/cloudinary");
const otp_redis_helper_1 = require("../Utils/utils/auth-utils/otp-redis-helper");
let AuthService = class AuthService {
    constructor(userRepository, notificationservice, jwtService) {
        //Notify admin for New User
        this.notifyAdminsOfNewUser = async (user) => {
            try {
                // Find all admin users
                const admins = await this._userRepository.getAllAdmins();
                if (admins.length === 0) {
                    logger_1.default.info("No admins found to notify for new user registration");
                    return;
                }
                logger_1.default.info(admins);
                // Create new_user notifications for each admin
                for (const admin of admins) {
                    const notification = await this._notificationService.sendNotification(admin._id.toString(), "new_user", user._id.toString(), user._id.toString(), "user");
                    logger_1.default.info(`Created new_user notification for admin ${admin._id}: ${notification.id}`);
                }
                logger_1.default.info(`Created new_user notifications for ${admins.length} admins`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error notifying admins of new user ${user._id}: ${err.message}`);
                throw new error_handler_1.ServiceError(`Failed to notify admins`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.signup = async (data) => {
            try {
                const { name, email, password } = data;
                const normalizedEmail = email.toLowerCase().trim();
                const userExists = await this._userRepository.findUserByEmail(email);
                if (userExists) {
                    throw new error_handler_1.ServiceError("User already exists", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                const user = await this._userRepository.createUser({
                    name,
                    email,
                    password: hashedPassword,
                });
                logger_1.default.info(`User created successfully: ${user._id}`);
                // Notify admins of new user
                await this.notifyAdminsOfNewUser(user);
                // Generate & send OTP for email verification
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "signup",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for signing up on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                return {
                    user: (0, user_mapper_1.toUserDTO)(user),
                    otpId,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in signup for email ${data.email}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to signup user", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.login = async (email, password) => {
            const normalizedEmail = email.toLowerCase().trim();
            try {
                const user = await this._userRepository.findUserByEmail(email);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (user.isBlocked) {
                    throw new error_handler_1.ServiceError("Blocked", status_code_enums_1.StatusCodes.FORBIDDEN);
                }
                if (!user.password) {
                    throw new error_handler_1.ServiceError("This account is registered using a third-party provider. Please log in with your provider", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const isMatch = await bcryptjs_1.default.compare(password, user.password);
                if (!isMatch) {
                    throw new error_handler_1.ServiceError("Invalid credentials", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "login",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for Login on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                return {
                    user: (0, user_mapper_1.toUserDTO)(user),
                    otpId,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in login for email ${email}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to login user", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.googleSignup = async (code) => {
            try {
                const { tokens } = await google_config_1.OAuth2Client.getToken(code);
                google_config_1.OAuth2Client.setCredentials(tokens);
                const userRes = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
                const { email, name, picture } = userRes.data;
                const normalizedEmail = email.toLowerCase().trim();
                const existingUser = await this._userRepository.findUserByEmail(email);
                if (existingUser) {
                    throw new error_handler_1.ServiceError("Email already registered", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "signup",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for signing up on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                const user = await this._userRepository.createUser({
                    name,
                    email,
                    provider: "google",
                    providerId: tokens.id_token,
                    profilePic: picture,
                    password: null,
                });
                logger_1.default.info(`User created successfully: ${user._id}`);
                // Notify admins of new user
                await this.notifyAdminsOfNewUser(user);
                return {
                    user: (0, user_mapper_1.toUserDTO)(user),
                    otpId,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in Google signup: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Google signup failed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.googleLogin = async (code) => {
            try {
                const { tokens } = await google_config_1.OAuth2Client.getToken(code);
                google_config_1.OAuth2Client.setCredentials(tokens);
                const userRes = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`);
                const { email } = userRes.data;
                const normalizedEmail = email.toLowerCase().trim();
                const existingUser = await this._userRepository.findUserByEmail(email);
                if (!existingUser) {
                    throw new error_handler_1.ServiceError("Email not registered", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "login",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for Login on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                return {
                    user: (0, user_mapper_1.toUserDTO)(existingUser),
                    otpId,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in Google login: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Google login failed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.githubSignup = async (code) => {
            try {
                const tokenResponse = await axios_1.default.post("https://github.com/login/oauth/access_token", {
                    client_id: env_config_1.default.githubclientid,
                    client_secret: env_config_1.default.githubclientsecret,
                    code,
                }, { headers: { Accept: "application/json" } });
                const { access_token } = tokenResponse.data;
                const userResponse = await axios_1.default.get("https://api.github.com/user", {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                let email = userResponse.data.email;
                if (!email) {
                    const emailsResponse = await axios_1.default.get("https://api.github.com/user/emails", {
                        headers: { Authorization: `Bearer ${access_token}` },
                    });
                    const primaryEmail = emailsResponse.data.find((e) => e.primary);
                    if (!primaryEmail) {
                        throw new error_handler_1.ServiceError("Email not found for GitHub user", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                    email = primaryEmail.email;
                }
                const normalizedEmail = email.toLowerCase().trim();
                const existingUser = await this._userRepository.findUserByEmail(email);
                if (existingUser) {
                    throw new error_handler_1.ServiceError("Email already registered", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "signup",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for signing up on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                const user = await this._userRepository.createUser({
                    name: userResponse.data.name || userResponse.data.login,
                    email,
                    provider: "github",
                    providerId: userResponse.data.login,
                    profilePic: userResponse.data.avatar_url,
                    password: null,
                });
                logger_1.default.info(`User created successfully: ${user._id}`);
                // Notify admins of new user
                await this.notifyAdminsOfNewUser(user);
                return {
                    user: (0, user_mapper_1.toUserDTO)(user),
                    otpId,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in GitHub signup: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("GitHub signup failed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.githubLogin = async (code) => {
            try {
                const tokenResponse = await axios_1.default.post("https://github.com/login/oauth/access_token", {
                    client_id: env_config_1.default.githubclientid,
                    client_secret: env_config_1.default.githubclientsecret,
                    code,
                }, { headers: { Accept: "application/json" } });
                const { access_token } = tokenResponse.data;
                const userResponse = await axios_1.default.get("https://api.github.com/user", {
                    headers: { Authorization: `Bearer ${access_token}` },
                });
                let email = userResponse.data.email;
                if (!email) {
                    const emailsResponse = await axios_1.default.get("https://api.github.com/user/emails", {
                        headers: { Authorization: `Bearer ${access_token}` },
                    });
                    const primaryEmail = emailsResponse.data.find((e) => e.primary);
                    if (!primaryEmail) {
                        throw new error_handler_1.ServiceError("Email not found for GitHub user", status_code_enums_1.StatusCodes.BAD_REQUEST);
                    }
                    email = primaryEmail.email;
                }
                const normalizedEmail = email.toLowerCase().trim();
                const existingUser = await this._userRepository.findUserByEmail(email);
                if (!existingUser) {
                    throw new error_handler_1.ServiceError("Email not registered", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "login",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for Login on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                return {
                    user: (0, user_mapper_1.toUserDTO)(existingUser),
                    otpId,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in GitHub login: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("GitHub login failed", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.refreshToken = async (refreshToken) => {
            try {
                const decoded = this._jwtService.verifyRefreshToken(refreshToken);
                const newAccessToken = this._jwtService.generateAccessToken({
                    userId: decoded.userId,
                });
                logger_1.default.info(`Refreshed access token for userId: ${decoded.userId}`);
                return { newAccessToken };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error refreshing token: ${err.message}`);
                throw new error_handler_1.ServiceError("Invalid or expired refresh token", status_code_enums_1.StatusCodes.BAD_REQUEST, err);
            }
        };
        this.forgotPassword = async (email) => {
            try {
                const normalizedEmail = email.toLowerCase().trim();
                const user = await this._userRepository.findUserByEmail(normalizedEmail);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                    email: normalizedEmail,
                    purpose: "forgot_password",
                    emailSubject: "Verify your email - ConnectSphere",
                    emailBody: (otp) => `Your verification OTP for Resetting Your password on ConnectSphere is: ${otp}. It will expire shortly.`,
                });
                return otpId;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in forgot password for ${email}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to send OTP", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.verifyOTP = async (purpose, email, otpId, otp) => {
            const normalizedEmail = email.toLowerCase().trim();
            try {
                const result = await (0, otp_redis_helper_1.verifyOtpFromRedis)(purpose, normalizedEmail, otpId, otp);
                // Only LOGIN creates tokens
                if (purpose === "login") {
                    const user = await this._userRepository.findUserByEmail(normalizedEmail);
                    if (!user) {
                        throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                    }
                    await this._userRepository.incrementLoginCount(user._id.toString());
                    const updatedUser = await this._userRepository.findById(user._id.toString());
                    if (!updatedUser) {
                        throw new error_handler_1.ServiceError("User not updated", status_code_enums_1.StatusCodes.NOT_MODIFIED);
                    }
                    const accessToken = this._jwtService.generateAccessToken({
                        userId: user._id,
                        userRole: user.role,
                    });
                    const refreshToken = this._jwtService.generateRefreshToken({
                        userId: user._id,
                        userRole: user.role,
                    });
                    await this._userRepository.updateRefreshToken(user._id.toString(), refreshToken);
                    const needsReviewPrompt = updatedUser.loginCount >= 5 && !updatedUser.hasReviewed;
                    return {
                        purpose: "login",
                        user: (0, user_mapper_1.toUserDTO)(updatedUser),
                        accessToken,
                        refreshToken,
                        needsReviewPrompt,
                    };
                }
                return {
                    purpose,
                    email: result.email,
                };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error verifying OTP : ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to verify OTP", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.resendOtp = async (email, purpose) => {
            const normalizedEmail = email.toLowerCase().trim();
            const otpId = await (0, o_t_p_1.sendOtpAndStore)({
                email: normalizedEmail,
                purpose,
                emailSubject: "Your OTP - ConnectSphere",
                emailBody: (otp) => `Your OTP for ${purpose.replace("_", " ")} is: ${otp}. It will expire shortly.`,
            });
            return { otpId };
        };
        this.resetPassword = async (email, newPassword) => {
            try {
                const user = await this._userRepository.findUserByEmail(email);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (user.password && (await bcryptjs_1.default.compare(newPassword, user.password))) {
                    throw new error_handler_1.ServiceError("New password cannot be the same as the old password", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
                await this._userRepository.updatePassword(user._id.toString(), hashedPassword);
                logger_1.default.info(`Password reset for ${email}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error resetting password for ${email}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to reset password", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.logout = async (email) => {
            try {
                await this._userRepository.removeRefreshToken(email);
                logger_1.default.info(`User ${email} logged out`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error logging out user ${email}: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to logout user", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.verifyAdminPasskey = async (passkey) => {
            logger_1.default.info(`AdminPasskey from Server :${env_config_1.default.adminpasscode} and passkey from front end : ${passkey}`);
            try {
                if (passkey !== env_config_1.default.adminpasscode) {
                    throw new error_handler_1.ServiceError("Invalid admin passkey", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                logger_1.default.info(`Admin passkey verified`);
                return true;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error verifying admin passkey: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to verify admin passkey", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.checkProfileCompletion = async (userId) => {
            try {
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const isComplete = await this._userRepository.isProfileComplete(user);
                logger_1.default.info(`Profile completion checked for user ${userId}: ${isComplete}`);
                return isComplete;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error checking profile completion for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to check profile completion", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.profileDetails = async (userId) => {
            try {
                const user = await this._userRepository.findById(userId);
                logger_1.default.info(`Fetched profile details for user ${userId}`);
                return (0, user_mapper_1.toUserDTO)(user);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching profile details for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch profile details", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateUserProfile = async (userId, data) => {
            try {
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                let profilePic = user.profilePic ?? undefined;
                let coverPic = user.coverPic ?? undefined;
                if (data.profilePicFile) {
                    const { url } = await (0, cloudinary_1.uploadMedia)(data.profilePicFile.path, "profiles", data.profilePicFile.size);
                    profilePic = url;
                }
                if (data.coverPicFile) {
                    const { url } = await (0, cloudinary_1.uploadMedia)(data.coverPicFile.path, "covers", data.coverPicFile.size);
                    coverPic = url;
                }
                const updatedData = {
                    name: data.name ?? user.name,
                    email: data.email ?? user.email,
                    phone: data.phone ?? user.phone,
                    dateOfBirth: data.dateOfBirth
                        ? new Date(data.dateOfBirth)
                        : user.dateOfBirth,
                    jobTitle: data.jobTitle ?? user.jobTitle,
                    industry: data.industry ?? user.industry,
                    reasonForJoining: data.reasonForJoining ?? user.reasonForJoining,
                    profilePic,
                    coverPic,
                };
                const updatedUser = await this._userRepository.update(userId, updatedData);
                if (!updatedUser) {
                    throw new error_handler_1.ServiceError("Failed to update user profile", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Updated profile for user ${userId}`);
                return (0, user_mapper_1.toUserDTO)(updatedUser);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating profile for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update user profile", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updatePassword = async (userId, currentPassword, newPassword) => {
            try {
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("Cannot Update password", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (!user.password) {
                    throw new error_handler_1.ServiceError("Cannot update Password", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                // Verify current password
                const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
                if (!isMatch) {
                    throw new error_handler_1.ServiceError("Current password is incorrect", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                // Hash new password
                const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
                const updatedUser = await this._userRepository.update(userId, {
                    password: hashedPassword,
                });
                if (!updatedUser) {
                    throw new error_handler_1.ServiceError("Failed to update password", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Updated password for user ${userId}`);
                return (0, user_mapper_1.toUserDTO)(updatedUser);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating password for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update password", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.fetchAllUsers = async () => {
            try {
                const users = await this._userRepository.fetchAllUsers();
                return (0, user_mapper_1.toUserDTOs)(users);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error in fetchAllUsers: ${err.message}`);
                throw new error_handler_1.ServiceError("Failed to fetch all users", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllUsers = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all users with query: ${JSON.stringify(query)}`);
                const { users, total } = await this._userRepository.getAllUsers(query);
                return { users: (0, user_mapper_1.toUserDTOs)(users), total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching all users: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch all users", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.blockUser = async (id) => {
            try {
                const user = await this._userRepository.getUserById(id);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                await this._userRepository.blockUser(id);
                logger_1.default.info(`Blocked user: ${id}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error blocking user ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError(`Failed to block user ${id}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.unblockUser = async (id) => {
            try {
                const user = await this._userRepository.getUserById(id);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                await this._userRepository.unblockUser(id);
                logger_1.default.info(`Unblocked user: ${id}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error unblocking user ${id}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError(`Failed to unblock user ${id}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.changeRole = async (userId, role) => {
            try {
                const user = await this._userRepository.getUserById(userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedUser = await this._userRepository.updateUserRole(userId, role);
                if (!updatedUser) {
                    throw new error_handler_1.ServiceError("Failed to update user role", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Updated role for user ${userId} to ${role}`);
                return (0, user_mapper_1.toUserDTO)(updatedUser);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating role for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError(`Failed to update role for user ${userId}`, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllUsersAdmin = async (query = {}) => {
            try {
                logger_1.default.debug(`Fetching all users for admin with query: ${JSON.stringify(query)}`);
                const { users, total } = await this._userRepository.getAllUsers(query);
                return { users: (0, user_mapper_1.toUserAdminDTOs)(users), total };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching all users for admin: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError('Failed to fetch all users for admin', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._userRepository = userRepository;
        this._notificationService = notificationservice;
        this._jwtService = jwtService;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IUserRepository')),
    __param(1, (0, inversify_1.inject)('INotificationService')),
    __param(2, (0, inversify_1.inject)('IJWTService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], AuthService);
//# sourceMappingURL=auth-service.js.map