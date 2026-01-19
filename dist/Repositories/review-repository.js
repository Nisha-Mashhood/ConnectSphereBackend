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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const base_repositry_1 = require("../core/repositries/base-repositry");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const review_model_1 = __importDefault(require("../Models/review-model"));
const status_code_enums_1 = require("../enums/status-code-enums");
let ReviewRepository = class ReviewRepository extends base_repositry_1.BaseRepository {
    constructor() {
        super(review_model_1.default);
        this.toObjectId = (id) => {
            if (!id) {
                logger_1.default.warn('Missing ID when converting to ObjectId');
                throw new error_handler_1.RepositoryError('Invalid ID: ID is required', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            const idStr = typeof id === 'string' ? id : id.toString();
            if (!mongoose_1.Types.ObjectId.isValid(idStr)) {
                logger_1.default.warn(`Invalid ObjectId format: ${idStr}`);
                throw new error_handler_1.RepositoryError('Invalid ID: must be a 24 character hex string', status_code_enums_1.StatusCodes.BAD_REQUEST);
            }
            return new mongoose_1.Types.ObjectId(idStr);
        };
        this.createReview = async (data) => {
            try {
                logger_1.default.debug(`Creating review for user: ${data.userId}`);
                const review = await this.create({
                    userId: this.toObjectId(data.userId),
                    rating: data.rating,
                    comment: data.comment,
                    isApproved: false,
                    isSelect: false,
                    createdAt: new Date(),
                });
                logger_1.default.info(`Review created: ${review._id}`);
                return review;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error creating review for user ${data.userId}`, err);
                throw new error_handler_1.RepositoryError('Error creating review', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.findReviewById = async (reviewId) => {
            try {
                logger_1.default.debug(`Fetching review by ID: ${reviewId}`);
                const review = await this.model
                    .findById(this.toObjectId(reviewId))
                    .populate('userId', '_id email name')
                    .exec();
                if (!review) {
                    logger_1.default.warn(`Review not found: ${reviewId}`);
                    throw new error_handler_1.RepositoryError(`Review not found with ID: ${reviewId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Review found: ${reviewId}`);
                return review;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching review by ID ${reviewId}`, err);
                throw new error_handler_1.RepositoryError('Error fetching review by ID', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.updateReview = async (reviewId, updates) => {
            try {
                logger_1.default.debug(`Updating review: ${reviewId}`);
                const review = await this.model
                    .findByIdAndUpdate(this.toObjectId(reviewId), updates, { new: true })
                    .populate('userId', '_id email name')
                    .exec();
                if (!review) {
                    logger_1.default.warn(`Review not found: ${reviewId}`);
                    throw new error_handler_1.RepositoryError(`Review not found with ID: ${reviewId}`, status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                logger_1.default.info(`Review updated: ${reviewId}`);
                return review;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error updating review ${reviewId}`, err);
                throw new error_handler_1.RepositoryError('Error updating review', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSelectedReviews = async () => {
            try {
                logger_1.default.debug('Fetching selected and approved reviews');
                const reviews = await this.model
                    .find({ isSelect: true, isApproved: true })
                    .populate('userId', '_id email name')
                    .exec();
                logger_1.default.info(`Fetched ${reviews.length} selected and approved reviews`);
                return reviews;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching selected reviews`, err);
                throw new error_handler_1.RepositoryError('Error fetching selected reviews', status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
    }
    async getAllReviews({ page = 1, limit = 10, search = "", }) {
        try {
            logger_1.default.debug(`Fetching reviews paginated (page=${page}, limit=${limit}, search=${search})`);
            const matchStage = search.trim() !== ""
                ? {
                    $or: [
                        { comment: { $regex: search, $options: "i" } },
                        { "userId.name": { $regex: search, $options: "i" } },
                        { "userId.email": { $regex: search, $options: "i" } },
                    ],
                }
                : {};
            const pipeline = [
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId",
                    },
                },
                {
                    $unwind: {
                        path: "$userId",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $match: matchStage },
                { $sort: { createdAt: -1 } },
                {
                    $facet: {
                        reviews: [
                            { $skip: (page - 1) * limit },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    reviewId: 1,
                                    rating: 1,
                                    comment: 1,
                                    isApproved: 1,
                                    isSelect: 1,
                                    createdAt: 1,
                                    userId: 1,
                                },
                            },
                        ],
                        total: [{ $count: "count" }],
                    },
                },
            ];
            const result = await this.model.aggregate(pipeline).exec();
            const reviews = result[0]?.reviews || [];
            const total = result[0]?.total[0]?.count || 0;
            return {
                reviews: reviews,
                total,
                page,
                pages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            logger_1.default.error("Error fetching paginated reviews", error);
            throw new error_handler_1.RepositoryError("Error fetching paginated reviews", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, error);
        }
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], ReviewRepository);
//# sourceMappingURL=review-repository.js.map