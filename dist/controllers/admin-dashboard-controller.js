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
exports.AdminController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const base_controller_1 = require("../core/controller/base-controller");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
const status_code_enums_1 = require("../enums/status-code-enums");
const error_handler_1 = require("../core/utils/error-handler");
let AdminController = class AdminController extends base_controller_1.BaseController {
    constructor(adminService) {
        super();
        this.getTotalUsersCount = async (_req, res, next) => {
            try {
                const count = await this._adminService.getTotalUsersCount();
                this.sendSuccess(res, { totalUsers: count }, messages_1.ADMIN_MESSAGES.TOTAL_USERS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getTotalMentorsCount = async (_req, res, next) => {
            try {
                const count = await this._adminService.getTotalMentorsCount();
                this.sendSuccess(res, { totalMentors: count }, messages_1.ADMIN_MESSAGES.TOTAL_MENTORS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getTotalRevenue = async (_req, res, next) => {
            try {
                const revenue = await this._adminService.getTotalRevenue();
                this.sendSuccess(res, revenue, messages_1.ADMIN_MESSAGES.TOTAL_REVENUE);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getPendingMentorRequestsCount = async (_req, res, next) => {
            try {
                const count = await this._adminService.getPendingMentorRequestsCount();
                this.sendSuccess(res, { pendingMentorRequests: count }, messages_1.ADMIN_MESSAGES.PENDING_MENTOR_REQUESTS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getActiveCollaborationsCount = async (_req, res, next) => {
            try {
                const count = await this._adminService.getActiveCollaborationsCount();
                this.sendSuccess(res, { activeCollaborations: count }, messages_1.ADMIN_MESSAGES.ACTIVE_COLLABORATIONS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getRevenueTrends = async (req, res, next) => {
            try {
                const { timeFormat, days } = req.query;
                const trends = await this._adminService.getRevenueTrends(timeFormat, Number(days));
                this.sendSuccess(res, trends, messages_1.ADMIN_MESSAGES.REVENUE_TRENDS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getUserGrowth = async (req, res, next) => {
            try {
                const { timeFormat, days } = req.query;
                const growth = await this._adminService.getUserGrowth(timeFormat, Number(days));
                this.sendSuccess(res, growth, messages_1.ADMIN_MESSAGES.USER_GROWTH);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getPendingMentorRequests = async (req, res, next) => {
            try {
                const { limit } = req.query;
                const requests = await this._adminService.getPendingMentorRequests(Number(limit));
                this.sendSuccess(res, requests, messages_1.ADMIN_MESSAGES.PENDING_REQUESTS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getTopMentors = async (req, res, next) => {
            try {
                const { limit } = req.query;
                const mentors = await this._adminService.getTopMentors(Number(limit));
                this.sendSuccess(res, mentors, messages_1.ADMIN_MESSAGES.TOP_MENTORS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        this.getRecentCollaborations = async (req, res, next) => {
            try {
                const { limit } = req.query;
                const collaborations = await this._adminService.getRecentCollaborations(Number(limit));
                this.sendSuccess(res, collaborations, messages_1.ADMIN_MESSAGES.RECENT_COLLABORATIONS);
            }
            catch (error) {
                logger_1.default.info(error);
                next(error);
            }
        };
        // Get Admin profile details
        this.getAdminProfileDetails = async (req, res, next) => {
            try {
                const userId = req.params.id;
                logger_1.default.debug(`Fetching profile details for userId: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const userDetails = await this._adminService.AdminprofileDetails(userId);
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
        // Update Admin profile
        this.updateAdminDetails = async (req, res, next) => {
            try {
                const userId = req.params.id;
                logger_1.default.debug(`Updating profile for userId: ${userId}`);
                if (!userId) {
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const data = req.body;
                const profilePicFile = req.files?.["profilePic"]?.[0];
                if (profilePicFile)
                    data.profilePicFile = profilePicFile;
                const updatedUser = await this._adminService.updateAdminProfile(userId, data);
                this.sendSuccess(res, { user: updatedUser }, messages_1.AUTH_MESSAGES.PROFILE_UPDATED);
                logger_1.default.info(`Profile updated for userId: ${userId}`);
            }
            catch (error) {
                logger_1.default.error(`Error updating profile for userId ${req.params.id || "unknown"}: ${error}`);
                next(error);
            }
        };
        this._adminService = adminService;
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IAdminService')),
    __metadata("design:paramtypes", [Object])
], AdminController);
//# sourceMappingURL=admin-dashboard-controller.js.map