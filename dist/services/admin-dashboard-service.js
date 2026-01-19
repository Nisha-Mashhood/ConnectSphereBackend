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
exports.AdminService = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const mentor_mapper_1 = require("../Utils/mappers/mentor-mapper");
const collaboration_mapper_1 = require("../Utils/mappers/collaboration-mapper");
const user_mapper_1 = require("../Utils/mappers/user-mapper");
const cloudinary_1 = require("../core/utils/cloudinary");
let AdminService = class AdminService {
    constructor(adminRepository, userRepository) {
        this.getTotalUsersCount = async () => {
            try {
                const count = await this._adminRepository.getTotalUsersCount();
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTotalUsersCount", err);
                throw new error_handler_1.ServiceError("Failed to fetch total users count", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTotalMentorsCount = async () => {
            try {
                const count = await this._adminRepository.getTotalMentorsCount();
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTotalMentorsCount", err);
                throw new error_handler_1.ServiceError("Failed to fetch total mentors count", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTotalRevenue = async () => {
            try {
                const revenue = await this._adminRepository.getTotalRevenue();
                return revenue;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTotalRevenue", err);
                throw new error_handler_1.ServiceError("Failed to fetch total revenue", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getPendingMentorRequestsCount = async () => {
            try {
                const count = await this._adminRepository.getPendingMentorRequestsCount();
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getPendingMentorRequestsCount", err);
                throw new error_handler_1.ServiceError("Failed to fetch pending mentor requests count", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getActiveCollaborationsCount = async () => {
            try {
                const count = await this._adminRepository.getActiveCollaborationsCount();
                return count;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getActiveCollaborationsCount", err);
                throw new error_handler_1.ServiceError("Failed to fetch active collaborations count", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getRevenueTrends = async (timeFormat, days) => {
            try {
                if (!timeFormat || !days) {
                    throw new error_handler_1.ServiceError("Invalid parameters: timeFormat and days are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const trends = await this._adminRepository.getRevenueTrends(timeFormat, days);
                return trends;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getRevenueTrends", err);
                throw new error_handler_1.ServiceError("Failed to fetch revenue trends", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUserGrowth = async (timeFormat, days) => {
            try {
                if (!timeFormat || !days) {
                    throw new error_handler_1.ServiceError("Invalid parameters: timeFormat and days are required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const growth = await this._adminRepository.getUserGrowth(timeFormat, days);
                return growth;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getUserGrowth", err);
                throw new error_handler_1.ServiceError("Failed to fetch user growth", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getPendingMentorRequests = async (limit) => {
            try {
                if (limit && limit < 0) {
                    throw new error_handler_1.ServiceError("Invalid limit: must be a non-negative number", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const requests = await this._adminRepository.getPendingMentorRequests(limit);
                return (0, mentor_mapper_1.toMentorDTOs)(requests);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getPendingMentorRequests", err);
                throw new error_handler_1.ServiceError("Failed to fetch pending mentor requests", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTopMentors = async (limit) => {
            try {
                if (!limit || limit < 0) {
                    throw new error_handler_1.ServiceError("Invalid limit: must be a positive number", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const mentors = await this._adminRepository.getTopMentors(limit);
                return mentors;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTopMentors", err);
                throw new error_handler_1.ServiceError("Failed to fetch top mentors", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getRecentCollaborations = async (limit) => {
            try {
                if (!limit || limit < 0) {
                    throw new error_handler_1.ServiceError("Invalid limit: must be a positive number", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const collaborations = await this._adminRepository.getRecentCollaborations(limit);
                return (0, collaboration_mapper_1.toCollaborationDTOs)(collaborations);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getRecentCollaborations", err);
                throw new error_handler_1.ServiceError("Failed to fetch recent collaborations", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.AdminprofileDetails = async (userId) => {
            try {
                const user = await this._userRepository.findById(userId);
                logger_1.default.info(`Fetched profile details for user ${userId}`);
                return (0, user_mapper_1.toUserAdminDTO)(user);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching profile details for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch profile details", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateAdminProfile = async (userId, data) => {
            try {
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                let profilePic = user.profilePic ?? undefined;
                if (data.profilePicFile) {
                    const { url } = await (0, cloudinary_1.uploadMedia)(data.profilePicFile.path, "profiles", data.profilePicFile.size);
                    profilePic = url;
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
                };
                const updatedUser = await this._userRepository.update(userId, updatedData);
                if (!updatedUser) {
                    throw new error_handler_1.ServiceError("Failed to update user profile", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Updated profile for user ${userId}`);
                return (0, user_mapper_1.toUserAdminDTO)(updatedUser);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating profile for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to update user profile", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._userRepository = userRepository;
        this._adminRepository = adminRepository;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IAdminRepository')),
    __param(1, (0, inversify_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object])
], AdminService);
//# sourceMappingURL=admin-dashboard-service.js.map