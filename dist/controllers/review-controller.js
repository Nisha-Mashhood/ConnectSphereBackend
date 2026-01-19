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
exports.ReviewController = void 0;
const inversify_1 = require("inversify");
const logger_1 = __importDefault(require("../core/utils/logger"));
const error_handler_1 = require("../core/utils/error-handler");
const status_code_enums_1 = require("../enums/status-code-enums");
const base_controller_1 = require("../core/controller/base-controller");
const messages_1 = require("../constants/messages");
const error_messages_1 = require("../constants/error-messages");
let ReviewController = class ReviewController extends base_controller_1.BaseController {
    constructor(reviewService) {
        super();
        this.submitReview = async (req, res, next) => {
            try {
                const { userId, rating, comment } = req.body;
                logger_1.default.debug(`Submitting review for user: ${userId}`);
                if (!userId || !rating || !comment) {
                    logger_1.default.error("Missing required fields: userId, rating, or comment");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_REVIEW_FIELDS, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                const review = await this._reviewService.submitReview(userId, rating, comment);
                this.sendCreated(res, review, messages_1.REVIEW_MESSAGES.REVIEW_SUBMITTED);
            }
            catch (error) {
                logger_1.default.error(`Error submitting review: ${error.message}`);
                next(error);
            }
        };
        this.skipReview = async (req, res, next) => {
            try {
                const { userId } = req.body;
                logger_1.default.debug(`Skipping review for user: ${userId}`);
                if (!userId) {
                    logger_1.default.error("Missing userId");
                    throw new error_handler_1.HttpError(error_messages_1.ERROR_MESSAGES.REQUIRED_USER_ID, status_code_enums_1.StatusCodes.BAD_REQUEST);
                }
                await this._reviewService.skipReview(userId);
                this.sendSuccess(res, null, messages_1.REVIEW_MESSAGES.REVIEW_SKIPPED);
            }
            catch (error) {
                logger_1.default.error(`Error skipping review: ${error.message}`);
                next(error);
            }
        };
        this.getAllReviews = async (req, res, next) => {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;
                const search = req.query.search || "";
                logger_1.default.debug(`Controller: fetching reviews (page=${page}, limit=${limit}, search=${search})`);
                const result = await this._reviewService.getAllReviews({
                    page,
                    limit,
                    search,
                });
                this.sendSuccess(res, result, messages_1.REVIEW_MESSAGES.REVIEWS_FETCHED);
            }
            catch (error) {
                logger_1.default.error(`Error fetching paginated reviews: ${error.message}`);
                next(error);
            }
        };
        this.approveReview = async (req, res, next) => {
            try {
                const { reviewId } = req.params;
                logger_1.default.debug(`Approving review: ${reviewId}`);
                const review = await this._reviewService.approveReview(reviewId);
                this.sendSuccess(res, review, messages_1.REVIEW_MESSAGES.REVIEW_APPROVED);
            }
            catch (error) {
                logger_1.default.error(`Error approving review: ${error.message}`);
                next(error);
            }
        };
        this.selectReview = async (req, res, next) => {
            try {
                const { reviewId } = req.params;
                logger_1.default.debug(`Selecting review: ${reviewId}`);
                const review = await this._reviewService.selectReview(reviewId);
                this.sendSuccess(res, review, messages_1.REVIEW_MESSAGES.REVIEW_SELECTED);
            }
            catch (error) {
                logger_1.default.error(`Error selecting review: ${error.message}`);
                next(error);
            }
        };
        this.cancelApproval = async (req, res, next) => {
            try {
                const { reviewId } = req.params;
                logger_1.default.debug(`Canceling approval for review: ${reviewId}`);
                const review = await this._reviewService.cancelApproval(reviewId);
                this.sendSuccess(res, review, messages_1.REVIEW_MESSAGES.REVIEW_APPROVAL_CANCELED);
            }
            catch (error) {
                logger_1.default.error(`Error canceling approval: ${error.message}`);
                next(error);
            }
        };
        this.deselectReview = async (req, res, next) => {
            try {
                const { reviewId } = req.params;
                logger_1.default.debug(`Deselecting review: ${reviewId}`);
                const review = await this._reviewService.deselectReview(reviewId);
                this.sendSuccess(res, review, messages_1.REVIEW_MESSAGES.REVIEW_DESELECTED);
            }
            catch (error) {
                logger_1.default.error(`Error deselecting review: ${error.message}`);
                next(error);
            }
        };
        this.getSelectedReviews = async (_req, res, next) => {
            try {
                logger_1.default.debug("Fetching selected reviews");
                const reviews = await this._reviewService.getSelectedReviews();
                const data = reviews.length === 0 ? [] : reviews;
                const message = reviews.length === 0 ? messages_1.REVIEW_MESSAGES.NO_REVIEWS_FOUND : messages_1.REVIEW_MESSAGES.SELECTED_REVIEWS_FETCHED;
                this.sendSuccess(res, data, message);
            }
            catch (error) {
                logger_1.default.error(`Error fetching selected reviews: ${error.message}`);
                next(error);
            }
        };
        this._reviewService = reviewService;
    }
};
exports.ReviewController = ReviewController;
exports.ReviewController = ReviewController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)('IReviewService')),
    __metadata("design:paramtypes", [Object])
], ReviewController);
//# sourceMappingURL=review-controller.js.map