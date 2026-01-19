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
exports.ReviewService = void 0;
const inversify_1 = require("inversify");
const error_handler_1 = require("../core/utils/error-handler");
const logger_1 = __importDefault(require("../core/utils/logger"));
const status_code_enums_1 = require("../enums/status-code-enums");
const review_mapper_1 = require("../Utils/mappers/review-mapper");
let ReviewService = class ReviewService {
    constructor(reviewRepository, userRepository) {
        this.submitReview = async (userId, rating, comment) => {
            try {
                logger_1.default.debug(`Submitting review for user: ${userId}`);
                if (rating < 1 || rating > 5) {
                    logger_1.default.error(`Invalid rating: ${rating}`);
                    throw new error_handler_1.ServiceError("Rating must be between 1 and 5", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                if (!comment || comment.trim() === "") {
                    logger_1.default.error("Comment is required");
                    throw new error_handler_1.ServiceError("Comment is required", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    logger_1.default.error(`User not found: ${userId}`);
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (user.hasReviewed) {
                    logger_1.default.error(`User has already submitted a review: ${userId}`);
                    throw new error_handler_1.ServiceError("User has already submitted a review", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const review = await this._reviewRepository.createReview({ userId, rating, comment });
                const reviewDTO = (0, review_mapper_1.toReviewDTO)(review);
                if (!reviewDTO) {
                    logger_1.default.error(`Failed to map review ${review._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map review to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                await this._userRepository.update(userId, { hasReviewed: true, loginCount: 0 });
                logger_1.default.info(`Review submitted for user: ${userId}, review ID: ${review._id}`);
                return reviewDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error submitting review for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to submit review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.skipReview = async (userId) => {
            try {
                logger_1.default.debug(`Skipping review for user: ${userId}`);
                const user = await this._userRepository.findById(userId);
                if (!user) {
                    logger_1.default.error(`User not found: ${userId}`);
                    throw new error_handler_1.ServiceError("User not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                await this._userRepository.update(userId, { loginCount: 0 });
                logger_1.default.info(`Review skipped for user: ${userId}`);
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error skipping review for user ${userId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to skip review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getAllReviews = async ({ page = 1, limit = 10, search = "", }) => {
            try {
                logger_1.default.debug(`Fetching paginated reviews from service (page=${page}, limit=${limit}, search=${search})`);
                const result = await this._reviewRepository.getAllReviews({
                    page,
                    limit,
                    search,
                });
                const reviewsDTO = (0, review_mapper_1.toReviewDTOs)(result.reviews);
                return {
                    reviews: reviewsDTO,
                    total: result.total,
                    page: result.page,
                    pages: result.pages,
                };
            }
            catch (error) {
                logger_1.default.error(`Error fetching paginated reviews: ${error.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch paginated reviews", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, error);
            }
        };
        this.approveReview = async (reviewId) => {
            try {
                logger_1.default.debug(`Approving review: ${reviewId}`);
                const review = await this._reviewRepository.findReviewById(reviewId);
                if (!review) {
                    logger_1.default.error(`Review not found: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Review not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedReview = await this._reviewRepository.updateReview(reviewId, { isApproved: true });
                if (!updatedReview) {
                    logger_1.default.error(`Failed to update review: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Failed to update review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const reviewDTO = (0, review_mapper_1.toReviewDTO)(updatedReview);
                if (!reviewDTO) {
                    logger_1.default.error(`Failed to map review ${updatedReview._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map review to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Review approved: ${reviewId}`);
                return reviewDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error approving review ${reviewId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to approve review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.selectReview = async (reviewId) => {
            try {
                logger_1.default.debug(`Selecting review: ${reviewId}`);
                const review = await this._reviewRepository.findReviewById(reviewId);
                if (!review) {
                    logger_1.default.error(`Review not found: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Review not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (!review.isApproved) {
                    logger_1.default.error(`Review not approved: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Review must be approved before selecting", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedReview = await this._reviewRepository.updateReview(reviewId, { isSelect: true });
                if (!updatedReview) {
                    logger_1.default.error(`Failed to update review: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Failed to update review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const reviewDTO = (0, review_mapper_1.toReviewDTO)(updatedReview);
                if (!reviewDTO) {
                    logger_1.default.error(`Failed to map review ${updatedReview._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map review to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Review selected: ${reviewId}`);
                return reviewDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error selecting review ${reviewId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to select review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.cancelApproval = async (reviewId) => {
            try {
                logger_1.default.debug(`Canceling approval for review: ${reviewId}`);
                const review = await this._reviewRepository.findReviewById(reviewId);
                if (!review) {
                    logger_1.default.error(`Review not found: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Review not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                const updatedReview = await this._reviewRepository.updateReview(reviewId, {
                    isApproved: false,
                    isSelect: false,
                });
                if (!updatedReview) {
                    logger_1.default.error(`Failed to update review: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Failed to update review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const reviewDTO = (0, review_mapper_1.toReviewDTO)(updatedReview);
                if (!reviewDTO) {
                    logger_1.default.error(`Failed to map review ${updatedReview._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map review to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Approval canceled for review: ${reviewId}`);
                return reviewDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error canceling approval for review ${reviewId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to cancel approval", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.deselectReview = async (reviewId) => {
            try {
                logger_1.default.debug(`Deselecting review: ${reviewId}`);
                const review = await this._reviewRepository.findReviewById(reviewId);
                if (!review) {
                    logger_1.default.error(`Review not found: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Review not found", status_code_enums_1.StatusCodes.NOT_FOUND);
                }
                if (!review.isSelect) {
                    logger_1.default.error(`Review not selected: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Review not selected", status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const updatedReview = await this._reviewRepository.updateReview(reviewId, { isSelect: false });
                if (!updatedReview) {
                    logger_1.default.error(`Failed to update review: ${reviewId}`);
                    throw new error_handler_1.ServiceError("Failed to update review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                const reviewDTO = (0, review_mapper_1.toReviewDTO)(updatedReview);
                if (!reviewDTO) {
                    logger_1.default.error(`Failed to map review ${updatedReview._id} to DTO`);
                    throw new error_handler_1.ServiceError("Failed to map review to DTO", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR);
                }
                logger_1.default.info(`Review deselected: ${reviewId}`);
                return reviewDTO;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error deselecting review ${reviewId}: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to deselect review", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this.getSelectedReviews = async () => {
            try {
                logger_1.default.debug("Fetching selected reviews");
                const reviews = await this._reviewRepository.getSelectedReviews();
                const reviewDTOs = (0, review_mapper_1.toReviewDTOs)(reviews);
                logger_1.default.info(`Fetched ${reviewDTOs.length} selected reviews`);
                return reviewDTOs;
            }
            catch (error) {
                const err = error instanceof Error ? error : new Error(String(error));
                logger_1.default.error(`Error fetching selected reviews: ${err.message}`);
                throw error instanceof error_handler_1.ServiceError
                    ? error
                    : new error_handler_1.ServiceError("Failed to fetch selected reviews", status_code_enums_1.StatusCodes.INTERNAL_SERVER_ERROR, err);
            }
        };
        this._reviewRepository = reviewRepository;
        this._userRepository = userRepository;
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IReviewRepository')),
    __param(1, (0, inversify_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object])
], ReviewService);
//# sourceMappingURL=review-service.js.map