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
exports.AdminRepository = void 0;
const inversify_1 = require("inversify");
const mentor_model_1 = __importDefault(require("../Models/mentor-model"));
const collaboration_model_1 = __importDefault(require("../Models/collaboration-model"));
const user_model_1 = __importDefault(require("../Models/user-model"));
const mentor_requset_model_1 = __importDefault(require("../Models/mentor-requset-model"));
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const error_messages_1 = require("../constants/error-messages");
let AdminRepository = class AdminRepository {
    constructor(feedbackRepository) {
        this.getTotalUsersCount = async () => {
            try {
                return await user_model_1.default.countDocuments({ role: "user" });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTotalUsersCount", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_TOTAL_USERS_COUNT, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTotalMentorsCount = async () => {
            try {
                return await user_model_1.default.countDocuments({ role: "mentor" });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTotalMentorsCount", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_TOTAL_MENTORS_COUNT, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTotalRevenue = async () => {
            try {
                const result = await collaboration_model_1.default.aggregate([
                    { $match: { payment: true } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: "$price" },
                        },
                    },
                ]);
                const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
                const platformProfit = totalRevenue * 0.1;
                return { totalRevenue, platformProfit };
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTotalRevenue", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_TOTAL_REVENUE, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getPendingMentorRequestsCount = async () => {
            try {
                return await mentor_requset_model_1.default.countDocuments({ isAccepted: "Pending" });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getPendingMentorRequestsCount", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_PENDING_MENTOR_REQUESTS_COUNT, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getActiveCollaborationsCount = async () => {
            try {
                return await collaboration_model_1.default.countDocuments({ isCancelled: false });
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getActiveCollaborationsCount", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_ACTIVE_COLLABORATIONS_COUNT, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getRevenueTrends = async (timeFormat, days) => {
            try {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                const result = await collaboration_model_1.default.aggregate([
                    { $match: { createdAt: { $gte: startDate }, payment: true } },
                    {
                        $group: {
                            _id: { $dateToString: { format: timeFormat, date: "$createdAt" } },
                            totalRevenue: { $sum: "$price" },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ]);
                return result.map((item) => ({
                    name: item._id,
                    totalRevenue: item.totalRevenue,
                    platformRevenue: Math.round(item.totalRevenue * 0.1),
                    mentorRevenue: Math.round(item.totalRevenue * 0.9),
                }));
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getRevenueTrends", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_ACTIVE_COLLABORATIONS_COUNT, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getUserGrowth = async (timeFormat, days) => {
            try {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);
                const userGrowth = await user_model_1.default.aggregate([
                    { $match: { createdAt: { $gte: startDate } } },
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: { format: timeFormat, date: "$createdAt" },
                                },
                                role: "$role",
                            },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { "_id.date": 1 } },
                ]);
                const groupedByDate = {};
                userGrowth.forEach((item) => {
                    if (!groupedByDate[item._id.date]) {
                        groupedByDate[item._id.date] = {
                            name: item._id.date,
                            users: 0,
                            mentors: 0,
                        };
                    }
                    if (item._id.role === "user")
                        groupedByDate[item._id.date].users = item.count;
                    if (item._id.role === "mentor")
                        groupedByDate[item._id.date].mentors = item.count;
                });
                return Object.values(groupedByDate);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getUserGrowth", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_USER_GROWTH, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getPendingMentorRequests = async (limit) => {
            try {
                const query = mentor_model_1.default
                    .find({ isApproved: "Processing" })
                    .populate("userId", "name email")
                    .sort({ createdAt: -1 });
                if (limit)
                    query.limit(limit);
                return await query.exec();
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getPendingMentorRequests", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_PENDING_MENTOR_REQUESTS, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getTopMentors = async (limit) => {
            try {
                const topMentors = await collaboration_model_1.default.aggregate([
                    { $match: { payment: true, isCancelled: false } },
                    {
                        $group: {
                            _id: "$mentorId",
                            totalEarnings: { $sum: "$price" },
                            collaborationCount: { $sum: 1 },
                        },
                    },
                    { $sort: { totalEarnings: -1 } },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "mentors",
                            localField: "_id",
                            foreignField: "_id",
                            as: "mentorInfo",
                        },
                    },
                    { $unwind: "$mentorInfo" },
                    {
                        $lookup: {
                            from: "users",
                            localField: "mentorInfo.userId",
                            foreignField: "_id",
                            as: "userInfo",
                        },
                    },
                    { $unwind: "$userInfo" },
                    {
                        $project: {
                            _id: "$mentorInfo._id",
                            name: "$userInfo.name",
                            email: "$userInfo.email",
                            userId: "$userInfo._id",
                            profilePic: "$userInfo.profilePic",
                            totalEarnings: 1,
                            collaborationCount: 1,
                        },
                    },
                ]);
                const mentorsWithRatings = await Promise.all(topMentors.map(async (mentor) => {
                    const avgRating = await this._feedbackRepository.getMentorAverageRating(mentor._id.toString());
                    return {
                        ...mentor,
                        rating: avgRating > 0 ? Number(avgRating.toFixed(2)) : "No feedback",
                    };
                }));
                return mentorsWithRatings;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getTopMentors", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_TOP_MENTORS, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getRecentCollaborations = async (limit) => {
            try {
                return await collaboration_model_1.default
                    .find({ isCancelled: false })
                    .populate({ path: "userId", select: "name profilePic" })
                    .populate({
                    path: "mentorId",
                    populate: { path: "userId", select: "name profilePic" },
                })
                    .sort({ createdAt: -1 })
                    .limit(limit);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error("Error in getRecentCollaborations", err);
                throw new error_handler_1.RepositoryError(error_messages_1.ERROR_MESSAGES.FAILED_TO_FETCH_RECENT_COLLABORATIONS, status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._feedbackRepository = feedbackRepository;
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IFeedbackRepository')),
    __metadata("design:paramtypes", [Object])
], AdminRepository);
//# sourceMappingURL=admin-dashboard-repository.js.map